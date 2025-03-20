import { QueryCache } from "./QueryCache";
import { cache } from "./QueryLightProvider";





type ReturnQueryClientOptions = {
    getQueries: () => any;

}

export function queryClient(): ReturnQueryClientOptions {

    const getQueries = () => {
        return cache.getAll()
    }

    return {
        getQueries
    }
}