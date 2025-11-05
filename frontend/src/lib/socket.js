import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // userId -> socketId

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register user to map
  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User ${userId} mapped to socket ${socket.id}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const [userId, id] of Object.entries(userSocketMap)) {
      if (id === socket.id) delete userSocketMap[userId];
    }
  });
});

export { io, app, server };
