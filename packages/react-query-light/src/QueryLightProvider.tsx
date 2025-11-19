import { QueryCacheType } from "@rime-ui/query-light-core";
import React, { createContext, useContext, useEffect } from "react";

const QueryCacheContext = createContext<QueryCacheType | null>(null);

export const useQueryCache = () => {
  const context = useContext(QueryCacheContext);
  if (!context) {
    throw new Error("useQueryCache must be used within a QueryLightProvider");
  }
  return context;
};

export function QueryLightProvider({
  children,
  cache,
}: {
  children: React.ReactNode;
  cache: QueryCacheType;
}) {

  if (!cache) {
    throw new Error("QueryLightProvider requires a cache");
  }

  useEffect(() => {
    cache.mount()

    return () => cache.unmount()
  }, [cache]);

  return (
    <QueryCacheContext.Provider value={cache}>
      {children}
    </QueryCacheContext.Provider>
  );
}

