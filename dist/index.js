import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import notification from "./routes/notification.js";
import user from "./routes/user.js";
import deviceDetails from "./routes/deviceDetails.js";
import { createSSHTerminal } from "./util/sshTerminal.js";
import NatMapping from "./routes/natMapping.js";
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
// =========================================================
// MIDDLEWARE
// =========================================================
app.use(express.json());
app.use(cors());
// =========================================================
// ROUTES
// =========================================================
app.use("/api/v1/notification", notification);
app.use("/api/v1/devicedetail", deviceDetails);
app.use("/api/v1/user", user);
app.use("/api/v1/natmapping", NatMapping);
// =========================================================
// HTTP SERVER
// =========================================================
//
// IMPORTANT:
// Do NOT use app.listen().
// WebSocket needs the underlying HTTP server.
//
const server = http.createServer(app);
// =========================================================
// WEBSOCKET SERVER
// =========================================================
const wss = new WebSocketServer({
    noServer: true,
});
// =========================================================
// HTTP -> WEBSOCKET UPGRADE
// =========================================================
server.on("upgrade", (request, socket, head) => {
    try {
        const url = new URL(request.url || "", `http://${request.headers.host}`);
        const pathname = url.pathname;
        // ===================================================
        // EXPECTED URL:
        //
        // /api/v1/notification/ssh-terminal/:id
        // ===================================================
        const match = pathname.match(/^\/api\/v1\/notification\/ssh-terminal\/([^/]+)$/);
        // ---------------------------------------------------
        // Not our WebSocket route
        // ---------------------------------------------------
        if (!match) {
            socket.destroy();
            return;
        }
        const notificationId = match[1];
        console.log("🔌 SSH WebSocket request:", notificationId);
        // ===================================================
        // UPGRADE CONNECTION
        // ===================================================
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request, notificationId);
        });
    }
    catch (error) {
        console.error("❌ WebSocket upgrade error:", error);
        socket.destroy();
    }
});
// =========================================================
// WEBSOCKET CONNECTION
// =========================================================
wss.on("connection", (ws, _request, notificationId) => {
    console.log("🖥️ SSH terminal WebSocket connected:", notificationId);
    createSSHTerminal(ws, notificationId);
});
// =========================================================
// START SERVER
// =========================================================
async function startServer() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI ||
            "mongodb+srv://dty:Dinan%402004@online-db.kqagkqn.mongodb.net/AutoNetManagerDB?retryWrites=true&w=majority&appName=ONLINE-DB");
        console.log("✅ DB connected...");
        // =====================================================
        // IMPORTANT:
        // Use server.listen(), NOT app.listen()
        // =====================================================
        server.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`🔌 SSH WebSocket ready at ws://localhost:${PORT}/api/v1/notification/ssh-terminal/:id`);
        });
    }
    catch (err) {
        console.error("❌ DB connection error:", err);
    }
}
startServer();
//# sourceMappingURL=index.js.map