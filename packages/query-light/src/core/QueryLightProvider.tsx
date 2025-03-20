import React from "react";
import { QueryCache } from "./QueryCache";

export const cache = new QueryCache()

export default function QueryLightProvider({ children }: { children: React.ReactNode }) {

  return children
}
