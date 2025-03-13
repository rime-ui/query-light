import { useCallback, useEffect, useRef, useState } from "react"
import { QueryCache } from "./QueryCache"
import { deepEqual } from "./utils"


type QueryOptions = {
    staleTime: number
    retry: number
    retryDelay: number
}

const cache = new QueryCache()

export function useQueryLight<T>(queryKey: [string, string], queryFn: () => Promise<any>, options?: Partial<QueryOptions>) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [retries, setRetries] = useState<number>(0);

    const { staleTime = 0, retry = 0, retryDelay = 2000 } = options ?? {}
    const [keyName, keyValue] = queryKey
    const queryHash = `${keyName}-${keyValue}`

    const isFirstRender = useRef<boolean>(true)

    let staleTimeOutId = useRef<NodeJS.Timeout | undefined>(undefined)
    let retryIntervalId = useRef<NodeJS.Timeout | undefined>(undefined)

    const handleStaleTime = () => {
        staleTimeOutId.current = setTimeout(() => {
            console.log("cache removed")
            cache.remove(queryHash)
        }, staleTime)
    }


    console.log(queryHash)
    const queryFnHandler = useCallback(async () => {

        if (cache.get(queryHash)?.result) {
            const oldData = cache.get(queryHash)?.result
            console.log("cached")
            setData(oldData)
            return;
        }

        if (isFirstRender.current) {
            setIsLoading(true)
        }

        try {
            const data = await queryFn()
            cache.build(queryHash, { result: data, timestamp: Date.now() })
            console.log("not cached")

            setData(data)
        } catch (err) {
            setError(err as string)
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const refetchHandler = () => {
        queryFnHandler()
    }

    const invalidateQueryHandler = () => {
        if (cache.get(queryHash)?.result) {
            cache.remove(queryHash)
        }
    }

    useEffect(() => {
        queryFnHandler()

        handleStaleTime()

        isFirstRender.current = false

        return () => {
            clearTimeout(staleTimeOutId.current)
            clearInterval(retryIntervalId.current)
            isFirstRender.current = false
        }
    }, [])

    if (error && retry > 0) {
        retryIntervalId.current = setInterval(() => {
            queryFnHandler()
            if (retries > retry) {
                setRetries(prev => prev + 1)
            }
        }, retryDelay)
    }

    return {
        data,
        error,
        isLoading,
        refetch: refetchHandler,
        invalidateCurrentQuery: invalidateQueryHandler
    }
}
