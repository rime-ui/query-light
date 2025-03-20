type CacheEntry = {
    result?: any;
    timestamp?: number;
};

interface QueryCacheType {
    get(key: string): CacheEntry | null;
    build(key: string, value: CacheEntry): void;
    remove(key: string): void;
    clear(): void;
    getAll(): void
}


type QueryClient = {
    cache: QueryCacheType
}