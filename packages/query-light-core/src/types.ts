export interface CacheEntry<T = unknown> {
  result?: T;
  timestamp?: number;
  mounted?: boolean;
}

export interface QueryCacheType {
  get<T = unknown>(key: string): CacheEntry<T> | null;
  build<T = unknown>(key: string, value: CacheEntry<T>): void;
  remove(key: string): boolean;
  clear(): void;
  getAll(): Map<string, CacheEntry<unknown>>;
  size(): number;
  mount(): void;
  unmount(): void;
  subscribe?<T = unknown>(
    key: string,
    listener: (entry: CacheEntry<T> | null) => void,
  ): () => void;
}

export type QueryKey = readonly unknown[];

export interface QueryDefinition<TData = unknown, TKey extends QueryKey = QueryKey> {
  key: TKey;
  queryFn: () => Promise<TData>;
}

export type QueryDefinitionMap = Record<string, QueryDefinition<any, any>>;

export type QueryResultMap<TDefs extends QueryDefinitionMap> = {
  [K in keyof TDefs]: TDefs[K] extends QueryDefinition<infer TData, any> ? TData : never;
};

export type QueryKeyMap<TDefs extends QueryDefinitionMap> = {
  [K in keyof TDefs]: TDefs[K] extends QueryDefinition<any, infer TKey> ? TKey : never;
};
