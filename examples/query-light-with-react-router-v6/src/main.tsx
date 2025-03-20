import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Outlet, RouterProvider } from 'react-router-dom'
import { router } from './routes.tsx'
import QueryLightProvider from '../../../packages/query-light/src/core/QueryLightProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryLightProvider>
      <RouterProvider router={router} />
      <Outlet />
    </QueryLightProvider>
  </StrictMode>,
)
