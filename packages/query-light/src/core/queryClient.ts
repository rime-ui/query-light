import { QueryCache } from "./QueryCache";
import { cache } from "./QueryLightProvider";





type ReturnQueryClientOptions = {
    getQueries: () => any;
    invalidateQueries: () => any

}

export function queryClient(): ReturnQueryClientOptions {

    const getQueries = () => {
        return cache.getAll()
    }

    const invalidateQueries = (queryKey?: string[], callback?: (cache: QueryCacheType, queryKey: string) => any) => {
        const queryHash = queryKey?.join("-")

        if (!queryHash) throw new Error("queryKey is required!")

        cache.remove(queryHash)
        callback?.(cache, queryHash)
    }

    return {
        getQueries,
        invalidateQueries
    }
}