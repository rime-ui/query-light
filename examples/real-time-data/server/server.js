const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 5050 });
const clients = [];

wss.on("connection", (ws) => {
    console.log("Client connected");

    clients.push(ws);

    ws.on("message", (message) => {
        const decodedMessage = message.toString();
        console.log("Received:", decodedMessage);

        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(decodedMessage);
            }
        });
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});
