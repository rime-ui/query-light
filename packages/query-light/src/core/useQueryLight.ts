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


const cache = new QueryCache();

export function useQueryLight<T>(
    queryKey: [string, string?],
    queryFn: () => Promise<T>,
    options?: Partial<QueryOptions>
) {

    const {
        staleTime = 0,
        retry = 0,
        retryDelay = 2000,
        socketUrl = "",
        isWebSocket = false,
        initialData = null
    } = options ?? {};


    const [newData, setNewData] = useState<T>(initialData);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retries, setRetries] = useState<number>(0);

    const [keyName, keyValue] = queryKey;
    const queryHash = keyValue ? `${keyName}-${keyValue}` : keyName;

    const isFirstRender = useRef<boolean>(true);

    let staleTimeOutId = useRef<NodeJS.Timeout | undefined>(undefined);
    let retryIntervalId = useRef<NodeJS.Timeout | undefined>(undefined);
    const socketRef = useRef<WebSocket | null>(null);

    const handleStaleTime = () => {
        staleTimeOutId.current = setTimeout(() => {
            console.log("cache removed");
            cache.remove(queryHash);
        }, staleTime);
    };

    console.log(queryHash);

    cache.getAll();

    const queryFnHandler = useCallback(async () => {
        if (cache.get(queryHash)?.result) {
            const oldData = cache.get(queryHash)?.result;
            console.log("cached");
            setNewData(oldData);
            return;
        }

        if (isFirstRender.current) {
            setIsLoading(true);
        }

        try {
            const data = await queryFn?.();
            cache.build(queryHash, { result: data, timestamp: Date.now() });
            console.log("not cached");
            setNewData(data as T);
        } catch (err) {
            setError(err as string);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refetchHandler = () => {
        queryFnHandler();
    };

    const invalidateQueryHandler = () => {
        if (cache.get(queryHash)?.result) {
            cache.remove(queryHash);
        }
    };

    useEffect(() => {
        if (!isWebSocket) return;
        const socket = new WebSocket(socketUrl!);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
            console.log("event: ", event);
            if (typeof event.data === "string") {
                const data = JSON.parse(event.data);

                setNewData((prev) => {
                    if (Array.isArray(prev)) {
                        return Array.isArray(data) ? (data as T) : ([...prev, data] as T);
                    }
                    return data as T;
                });
            }
        };


        socket.onerror = (error) => {
            console.error("WebSocket error: ", error);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [socketUrl, queryFnHandler]);

    useEffect(() => {
        queryFnHandler();
        handleStaleTime();
        isFirstRender.current = false;

        if (cache.get(queryHash)?.result) {
            console.log("check if stale");
            setNewData(cache.get(queryHash)?.result);
        }

        return () => {
            clearTimeout(staleTimeOutId.current);
            clearInterval(retryIntervalId.current);
            isFirstRender.current = false;
        };
    }, []);

    if (error && retry > 0) {
        retryIntervalId.current = setInterval(() => {
            queryFnHandler();
            if (retries > retry) {
                setRetries((prev) => prev + 1);
            }
        }, retryDelay);
    }

    return {
        data: newData,
        error,
        isLoading,
        refetch: refetchHandler,
        invalidateCurrentQuery: invalidateQueryHandler,
    };
}
