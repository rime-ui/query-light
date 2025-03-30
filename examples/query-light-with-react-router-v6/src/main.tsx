import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider } from "react-router-dom";
import { router } from "./routes.tsx";
import { QueryCache, QueryLightProvider } from "@rime-ui/react-query-light";

const cache = new QueryCache()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryLightProvider cache={cache}>
      <RouterProvider router={router} />
      <Outlet />
    </QueryLightProvider>
  </StrictMode>,
);
