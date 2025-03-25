export interface CacheEntry {
  result?: any;
  timestamp?: number;
}

export interface QueryCacheType {
  get(key: string): CacheEntry | null;
  build(key: string, value: CacheEntry): void;
  remove(key: string): void;
  clear(): void;
  getAll(): void;
}

export interface QueryClient {
  cache: QueryCacheType;
}


export interface MutationCacheType {
  get(key: string): any;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}