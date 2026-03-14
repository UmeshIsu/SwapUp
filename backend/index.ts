import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { createServer } from "http";
import { initSocket } from "./services/socketService";

const app = express();
const httpServer = createServer(app); // This is the master server
const io = initSocket(httpServer);    // This attaches Socket.io to the master server

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.use(
  cors({
    origin: FRONTEND_ORIGIN
      ? FRONTEND_ORIGIN.split(",").map((s) => s.trim())
      : true,
    credentials: true,
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

const PORT: number = Number(process.env.PORT) || 5000;

// --- CRITICAL CHANGE START ---
// Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + Socket.io running on port ${PORT}`);
});
