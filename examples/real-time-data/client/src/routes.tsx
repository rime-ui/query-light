import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import SendMessagePage from "./SendMessagePage";






export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/send-msg",
        element: <SendMessagePage />
    }
])