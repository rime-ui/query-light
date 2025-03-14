import { useState, useEffect, useRef } from "react";
import { useQueryLight } from "../../../../packages/query-light/src";

const wsUrl = "ws://localhost:5050";
type Message = { text: string; timestamp: string; user: string; userAgent: string };

export default function Chat() {
    const { data: messages, isLoading } = useQueryLight(["1"], () =>
        fetch("http://localhost:5050/api/messages").then((res) => res.json()),
        { socketUrl: wsUrl, isWebSocket: true }
    );

    const [text, setText] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const socket = new WebSocket(wsUrl);
        setWs(socket);
        return () => socket.close();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isLoading) return <div style={{ textAlign: "center", padding: "20px", fontSize: "18px" }}>Loading...</div>;

    const sendMessage = () => {
        if (ws && text.trim()) {
            const message = JSON.stringify({ text: text.trim() });
            ws.send(message);
            setText("");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" }}>
            <div style={{ height: "300px", overflowY: "auto", padding: "10px", background: "#fff", borderRadius: "6px", border: "1px solid #ddd" }}>
                {messages?.map((msg: Message, index: number) => {
                    const isAlternate = index % 2 === 0;
                    return (
                        <div
                            key={index}
                            style={{
                                marginBottom: "10px",
                                padding: "8px",
                                borderRadius: "6px",
                                background: isAlternate ? "#e0e0e0" : "#c0e0ff"
                            }}
                        >
                            <b style={{ color: "#333" }}>{msg.user}</b>: {msg.text}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex", marginTop: "10px" }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                />
                <button
                    onClick={sendMessage}
                    style={{ marginLeft: "10px", padding: "10px 15px", border: "none", borderRadius: "6px", background: "#007bff", color: "#fff", cursor: "pointer" }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
