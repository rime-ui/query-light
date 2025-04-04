import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import TodoPage from "./components/TodoPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/todo/:id",
    element: <TodoPage />,
  },
]);
