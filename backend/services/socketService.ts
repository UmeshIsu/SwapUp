import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Allows your emulator to connect
      methods: ["GET", "POST"],
    },
  });

  // Middleware: Only allow users with a valid token to connect
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
      (socket as any).userId = decoded.id; // Attach userId to the socket
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

    // Join a private room based on their User ID so we can send direct messages
    socket.join(userId);

    socket.on("sendMessage", (data) => {
      const { receiverId, content, swapRequestId } = data;
      console.log(`Message from ${userId} to ${receiverId}: ${content}`);

      // Send the message specifically to the receiver's room
      io.to(receiverId).emit("newMessage", {
        senderId: userId,
        content,
        swapRequestId,
        createdAt: new Date(),
      });
    });

    socket.on("typing", (data) => {
      io.to(data.receiverId).emit("userTyping", { senderId: userId });
    });

    socket.on("stopTyping", (data) => {
      io.to(data.receiverId).emit("userStoppedTyping", { senderId: userId });
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};