const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");
const useragent = require("express-useragent");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect(
    "mongodb://testApp:testApp@localhost:27017/chat"
).then(() => console.log("Connected to MongoDB"));

const MessageSchema = new mongoose.Schema({
    text: String,
    timestamp: Date,
    user: String,
    userAgent: String,
});
const Message = mongoose.model("Message", MessageSchema);

app.use(cors());
app.use(express.json());
app.use(useragent.express());

app.get("/api/messages", async (req, res) => {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
});

wss.on("connection", (ws, req) => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const username = `User-${Math.floor(Math.random() * 1000)}`;

    ws.on("message", async (message) => {
        const msgData = JSON.parse(message);
        const msg = new Message({
            text: msgData.text,
            timestamp: new Date(),
            user: username,
            userAgent,
        });
        await msg.save();

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msg));
            }
        });
    });
});

server.listen(5050, () => console.log("Server running on port 5050"));
