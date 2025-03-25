import React from "react";
import { QueryCache } from "../../query-light-core/src";

export const cache = new QueryCache();

export default function QueryLightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
