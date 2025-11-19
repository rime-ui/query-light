import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useQueryCache } from "./QueryLightProvider";
import { initRetryer, type QueryKey } from "@rime-ui/query-light-main-core";
import { getWebSocketManager } from "./websocketManager";
import { createInitialQueryState, queryReducer } from "./queryStateMachine";
import type { QueryStatus } from "./queryStateMachine";

type QueryOptions = {
  staleTime: number;
  retry: number;
  retryDelay: number;
  socketUrl: string;
  isWebSocket: boolean;
  initialData: any;
  enabled: boolean;
};

type UseQueryLightReturn<T> = {
  /**
   * Always typed as the resolved query data. Guard with `isLoading` / `isError`
   * before using in order to avoid runtime null values.
   */
  data: T;
  /**
   * Access to the nullable shape in case you need to differentiate explicitly.
   */
  dataOrNull: T | null;
  error: unknown;
  isLoading: boolean;
  isError: boolean;
  status: QueryStatus;
  refetch: () => void;
  invalidateCurrentQuery: () => void;
};

export function useQueryLight<
  TData = unknown,
  TQueryFn extends () => Promise<TData> = () => Promise<TData>,
  TKey extends QueryKey = QueryKey,
>(
  queryKey: TKey,
  queryFn: TQueryFn,
  options?: Partial<QueryOptions>,
): UseQueryLightReturn<TData> {
  const {
    staleTime = 0,
    retry = 0,
    retryDelay = 2000,
    socketUrl = "",
    isWebSocket = false,
    initialData = null,
    enabled = true,
  } = options ?? {};

  const cache = useQueryCache();
  const queryHash = queryKey.join("-");

  const latestQueryFn = useRef<TQueryFn>(queryFn);
  useEffect(() => {
    latestQueryFn.current = queryFn;
  }, [queryFn]);

  const cachedEntry = cache.get<TData>(queryHash);

  const [state, dispatch] = useReducer(
    queryReducer<TData>,
    createInitialQueryState<TData>(
      ((cachedEntry?.result as TData | undefined) ?? (initialData as TData | null)) ?? null,
      enabled && !cachedEntry,
    ),
  );

  const { data, error, status } = state;

  const isLoading = status === "loading";
  const isError = status === "error";

  const abortControllerRef = useRef<AbortController | null>(null);
  const [retries, setRetries] = useState<number>(0);
  const retryIntervalId = useRef<NodeJS.Timeout | null>(null);

  const handleStaleTime = useCallback(() => {
    if (staleTime === Infinity) return;
    if (staleTime > 0) {
      setTimeout(() => {
        cache.remove(queryHash);
      }, staleTime);
    }
  }, [staleTime, queryHash, cache]);

  useEffect(() => {
    if (!cache.subscribe) return;

    const unsubscribe = cache.subscribe<TData>(
      queryHash,
      (entry: { result?: TData } | null) => {
        if (!entry) {
          dispatch({ type: "INVALIDATE", initialData: (initialData as TData | null) ?? null });
          return;
        }
        dispatch({ type: "RESOLVE", data: (entry.result ?? null) as TData });
      },
    );

    return unsubscribe;
  }, [cache, queryHash, initialData]);

  const queryFnHandler = useCallback(async () => {
    if (!enabled) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort("Request canceled due to new request");
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const cached = cache.get<TData>(queryHash);
    if (cached?.result) {
      dispatch({ type: "RESOLVE", data: cached.result as TData });
      return;
    }

    dispatch({ type: "FETCH" });

    try {
      const promise = latestQueryFn.current() as Promise<TData>;

      const abortPromise = new Promise((_, reject) => {
        abortController.signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });

      const result = (await Promise.race([promise, abortPromise])) as TData;

      if (!abortController.signal.aborted) {
        cache.build(queryHash, { result, timestamp: Date.now() });
        dispatch({ type: "RESOLVE", data: result });
      }
    } catch (err) {
      if (!abortController.signal.aborted && (err as Error)?.name !== "AbortError") {
        dispatch({ type: "REJECT", error: err });
      }
    }
  }, [queryHash, enabled, cache]);

  useEffect(() => {
    queryFnHandler();
    handleStaleTime();

    return () => {
      // Clean up: abort any pending request when component unmounts or dependencies change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryIntervalId.current) {
        clearInterval(retryIntervalId.current);
      }
    };
  }, [queryFnHandler, handleStaleTime]);

  useEffect(() => {
    if (!isWebSocket || !socketUrl) return;

    const manager = getWebSocketManager();

    const handler = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;

      const parsed = JSON.parse(event.data) as unknown;

      const current = cache.get<TData>(queryHash)?.result;
      const currentData = Array.isArray(current) ? current : current != null ? [current] : [];
      const incoming = Array.isArray(parsed) ? parsed : [parsed];
      const updated = [...currentData, ...incoming] as unknown as TData;

      cache.build<TData>(queryHash, {
        result: updated,
        timestamp: Date.now(),
      });
    };

    const unsubscribe = manager.subscribe(socketUrl, handler, { retry, retryDelay });

    return () => {
      unsubscribe();
    };
  }, [isWebSocket, socketUrl, cache, queryHash, retry, retryDelay]);

  useEffect(() => {
    initRetryer({
      error,
      handler: queryFnHandler,
      retries,
      retry,
      set: setRetries,
      retryDelay,
      retryIntervalId: retryIntervalId.current,
    });
  }, [error, retries, retry, retryDelay, queryFnHandler]);

  const nullableData = (data ?? null) as TData | null;

  return {
    data: nullableData as TData,
    dataOrNull: nullableData,
    error,
    isLoading,
    status,
    refetch: queryFnHandler,
    invalidateCurrentQuery: () => cache.remove(queryHash),
    isError,
  };
}
