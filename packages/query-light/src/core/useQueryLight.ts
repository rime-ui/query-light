import { useCallback, useEffect, useRef, useState } from "react";
import { QueryCache } from "./QueryCache";
import { deepEqual } from "./utils";

type QueryOptions = {
    staleTime: number;
    retry: number;
    retryDelay: number;
    socketUrl: `ws://${string}`;
    isWebSocket: boolean;
    initialData: any;
};

type ReturnOptions<T> = {
    data: T | null;
    error: any;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    invalidateCurrentQuery: () => void;
};

const cache = new QueryCache();

export function useQueryLight<T>(
    queryKey: [string, string?],
    queryFn: () => Promise<T>,
    options?: Partial<QueryOptions>
): ReturnOptions<T> {
    const {
        staleTime = 0,
        retry = 0,
        retryDelay = 2000,
        socketUrl = "",
        isWebSocket = false,
        initialData = null,
    } = options ?? {};

    const [data, setData] = useState<T | null>(() => {
        const cachedData = cache.get(queryKey.join("-"))?.result;
        return cachedData ?? initialData;
    });

    const [isLoading, setIsLoading] = useState<boolean>(!cache.get(queryKey.join("-")));
    const [error, setError] = useState<string | null>(null);
    const [retries, setRetries] = useState<number>(0);

    const queryHash = queryKey.join("-");
    const isFirstRender = useRef<boolean>(true);
    const retryIntervalId = useRef<NodeJS.Timeout | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const handleStaleTime = useCallback(() => {
        if (staleTime > 0) {
            setTimeout(() => {
                cache.remove(queryHash);
                console.log("Cache removed for", queryHash);
            }, staleTime);
        }
    }, [staleTime, queryHash]);

    const queryFnHandler = useCallback(async () => {
        if (cache.get(queryHash)?.result) {
            console.log("Using cached data");
            setData(cache.get(queryHash)?.result);
            return;
        }

        if (isFirstRender.current) {
            setIsLoading(true);
        }

        try {
            const result = await queryFn();
            cache.build(queryHash, { result, timestamp: Date.now() });
            setData(result);
            setError(null);
        } catch (err) {
            setError(err as string);
        } finally {
            setIsLoading(false);
        }
    }, [queryFn, queryHash]);

    useEffect(() => {
        queryFnHandler();
        handleStaleTime();
        isFirstRender.current = false;

        return () => {
            if (retryIntervalId.current) {
                clearInterval(retryIntervalId.current);
            }
        };
    }, [queryFnHandler, handleStaleTime]);

    useEffect(() => {
        if (!isWebSocket || !socketUrl) return;

        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => console.log("WebSocket connected");
        socket.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
                setData((prev) => (Array.isArray(prev) && Array.isArray(receivedData)
                    ? [...prev, ...receivedData]
                    : receivedData));
            } catch (err) {
                console.error("WebSocket data parsing error:", err);
            }
        };

        socket.onerror = (error) => console.error("WebSocket error:", error);
        socket.onclose = () => console.log("WebSocket closed");

        return () => {
            socket.close();
        };
    }, [isWebSocket, socketUrl]);

    useEffect(() => {
        if (error && retry > 0 && retries < retry) {
            retryIntervalId.current = setInterval(() => {
                queryFnHandler();
                setRetries((prev) => prev + 1);
            }, retryDelay);
        } else if (retries >= retry && retryIntervalId.current) {
            clearInterval(retryIntervalId.current);
        }
    }, [error, retries, retry, retryDelay, queryFnHandler]);

    return {
        data,
        error,
        isLoading,
        refetch: queryFnHandler,
        invalidateCurrentQuery: () => cache.remove(queryHash),
        isError: !!error,
    };
}
