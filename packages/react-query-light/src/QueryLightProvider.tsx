import { QueryCache } from "query-light-core/build";
import React from "react";
export const cache = new QueryCache();

export default function QueryLightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
