import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";

import { connectDB, isDatabaseConnected } from "./config/db.js";
import { seedDatabaseIfEmpty } from "./utils/seedData.js";
import { authService } from "./services/authService.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setIoInstance } from "./services/iotService.js";

// Routes
import authRouter from "./routes/auth.js";
import templesRouter from "./routes/temples.js";
import crowdRouter from "./routes/crowd.js";
import darshanSlotsRouter from "./routes/darshanSlots.js";
import bookingsRouter from "./routes/bookings.js";
import prasadamRouter from "./routes/prasadam.js";
import alertsRouter from "./routes/alerts.js";
import notificationsRouter from "./routes/notifications.js";
import paymentRouter from "./routes/payment.js";
import analyticsRouter from "./routes/analytics.js";
import emergencyRouter from "./routes/emergency.js";
import yatraRouter from "./routes/yatra.js";
import darshanRouter from "./routes/darshan.js";
import auditRouter from "./routes/audit.js";
import iotRouter from "./routes/iot.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

// Socket.IO Real-Time Server initialization
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

import {
  validateSessionToken,
  markSessionConnected,
  terminateCctvSession,
  getSessionByToken
} from "./services/cctvSessionService.js";

setIoInstance(io);

io.on("connection", (socket) => {
  console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

  socket.on("join_band", (bandId) => {
    const targetBand = bandId || "DV-BAND-0001";
    const room = `band_${targetBand}`;
    socket.join(room);
    console.log(`📡 [Socket.IO] Client ${socket.id} joined room ${room}`);
    socket.emit("connected", {
      status: "CONNECTED",
      bandId: targetBand,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("join_authority", () => {
    socket.join("authority");
    console.log(`🛡️ [Socket.IO] Client ${socket.id} joined authority room`);
    socket.emit("authority_connected", { status: "AUTHORITY_ONLINE" });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CCTV WebRTC Signaling Handlers (Admin Laptop <-> Phone Camera Publisher)
  // ─────────────────────────────────────────────────────────────────────────────

  socket.on("cctv_admin_join", ({ token }) => {
    if (!token) return;
    const room = `cctv_${token}`;
    socket.join(room);
    socket.cctvToken = token;
    socket.cctvRole = "admin";
    console.log(`📹 [CCTV WebRTC] Admin socket ${socket.id} joined session room ${room}`);
  });

  socket.on("cctv_phone_join", ({ token, camera }) => {
    if (!token) {
      socket.emit("cctv_error", { error: "NO_TOKEN", message: "No session token provided" });
      return;
    }

    const validation = validateSessionToken(token);
    if (!validation.valid) {
      socket.emit("cctv_error", { error: validation.error, message: "Invalid or expired session token" });
      return;
    }

    const session = validation.session;
    markSessionConnected(token, socket.id);

    const room = `cctv_${token}`;
    socket.join(room);
    socket.cctvToken = token;
    socket.cctvRole = "phone";
    console.log(`📱 [CCTV WebRTC] Phone socket ${socket.id} joined session room ${room} for camera ${session.cameraName}`);

    socket.emit("cctv_joined", {
      status: "CONNECTED",
      cameraName: session.cameraName,
      cameraId: session.cameraId,
      sessionId: session.sessionId
    });

    // Notify Admin peer that Phone camera is ready for WebRTC negotiation
    socket.to(room).emit("cctv_phone_ready", {
      cameraName: session.cameraName,
      cameraId: session.cameraId,
      sessionId: session.sessionId
    });
  });

  socket.on("cctv_signal", ({ token, signal }) => {
    if (!token || !signal) return;
    const room = `cctv_${token}`;
    // Relay SDP Offer or Answer to the other peer in the room
    socket.to(room).emit("cctv_signal", { signal, sender: socket.id });
  });

  socket.on("cctv_ice_candidate", ({ token, candidate }) => {
    if (!token || !candidate) return;
    const room = `cctv_${token}`;
    // Relay ICE candidate to the other peer in the room
    socket.to(room).emit("cctv_ice_candidate", { candidate, sender: socket.id });
  });

  socket.on("cctv_session_terminate", ({ token }) => {
    if (!token) return;
    terminateCctvSession(token);
    const room = `cctv_${token}`;
    io.to(room).emit("cctv_session_terminated", {
      reason: "ADMIN_TERMINATED",
      message: "The CCTV session was disconnected by the administrator."
    });
    console.log(`🛑 [CCTV WebRTC] Dispatched session termination for room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    if (socket.cctvToken) {
      const room = `cctv_${socket.cctvToken}`;
      socket.to(room).emit("cctv_peer_disconnected", {
        role: socket.cctvRole || "peer",
        sender: socket.id
      });
    }
  });
});

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "DivYatra Backend API",
    version: "1.0.0",
    database: isDatabaseConnected() ? "MongoDB Atlas (Connected)" : "Local In-Memory Mock Mode",
    socketIo: "Active",
    timestamp: new Date().toISOString(),
    supportedTemples: ["somnath", "dwarka", "ambaji", "pavagadh"],
  });
});

// Authentication Routes
app.use("/api/auth", authRouter);

// Core REST APIs
app.use("/api/temples", templesRouter);
app.use("/api/crowd", crowdRouter);
app.use("/api/darshan-slots", darshanSlotsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/prasadam", prasadamRouter);
app.use("/api/prasad", prasadamRouter); // backward compatibility alias
app.use("/api/alerts", alertsRouter);
app.use("/api/notifications", notificationsRouter);

// Secondary Support Endpoints
app.use("/api/payment", paymentRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/yatra", yatraRouter);
app.use("/api/darshan", darshanRouter);

// IoT Smart Band Simulator Endpoints
app.use("/api/iot", iotRouter);

// Audit Logging (server-side, uses service_role key — never exposed to frontend)
app.use("/api/audit", auditRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found on DivYatra API`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Initialize DB and Server
export const startServer = () => {
  const server = httpServer.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🛕 DivYatra API Server active on http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Live Darshan: http://localhost:${PORT}/api/darshan/live-status`);
    console.log(`   IoT API:      http://localhost:${PORT}/api/iot/band/DV-BAND-0001/state`);
    console.log(`====================================================`);
  });

  // Connect DB asynchronously
  connectDB().then(async (connected) => {
    if (connected) {
      await seedDatabaseIfEmpty();
      await authService.seedDemoUsers();
    }
  }).catch((err) => {
    console.warn("DB connection notice:", err.message);
  });

  return server;
};

// Start automatically if run directly
startServer();

export { app, httpServer, io };
export default app;

