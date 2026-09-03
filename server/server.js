import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB, isDatabaseConnected } from "./config/db.js";
import { seedDatabaseIfEmpty } from "./utils/seedData.js";
import { authService } from "./services/authService.js";
import { errorHandler } from "./middleware/errorHandler.js";

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

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
  const server = app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🛕 DivYatra API Server active on http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Live Darshan: http://localhost:${PORT}/api/darshan/live-status`);
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

export default app;
