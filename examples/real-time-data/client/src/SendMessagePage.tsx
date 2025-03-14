import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function SendMessagePage() {
    const [message, setMessage] = useState("");
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:5050");
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket is open now.");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
            console.log("Message sent:", message);
        } else {
            console.error("WebSocket is not open. Cannot send message.");
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>

            <Link to="/">Go back</Link>
        </div>
    );
}
