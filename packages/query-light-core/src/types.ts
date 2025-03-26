export interface CacheEntry {
  result?: any;
  timestamp?: number;
  mounted?: boolean;
}

export interface QueryCacheType {
  get(key: string): CacheEntry | null;
  build(key: string, value: CacheEntry): void;
  remove(key: string): void;
  clear(): void;
  getAll(): void;
  size(): void
  mount(): void
  unmount(): void
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
