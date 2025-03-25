// import { cache } from "../../react-query-light/src/QueryLightProvider";
// import { QueryCacheType } from "./types";

// interface ReturnQueryClientOptions {
//   getQueries: () => any;
//   invalidateQueries: () => any;
// }

// export function queryClient(): ReturnQueryClientOptions {
//   const getQueries = () => {
//     return cache.getAll();
//   };

//   const invalidateQueries = (
//     queryKey?: string[],
//     callback?: (cache: QueryCacheType, queryKey: string) => any,
//   ) => {
//     const queryHash = queryKey?.join("-");

//     if (typeof callback === "undefined" && queryHash)
//       return cache.remove(queryHash);

//     if (queryHash) callback?.(cache, queryHash);
//   };

//   return {
//     getQueries,
//     invalidateQueries,
//   };
// }
