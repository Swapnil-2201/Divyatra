import express from "express";
import {
  createBooking,
  getBookingById,
  getUserBookings,
  getAllBookings,
} from "../controllers/bookingController.js";
import { protect, optionalAuth, authorize } from "../middleware/auth.js";

const router = express.Router();

// POST /api/bookings (Create booking pass - supports both guest devotees and logged-in pilgrims)
router.post("/", optionalAuth, createBooking);

// GET /api/bookings/my (Retrieve booking history for authenticated pilgrim)
router.get("/my", protect, getUserBookings);

// GET /api/bookings/all (Retrieve all bookings for authority and admin)
router.get("/all", protect, authorize("authority", "admin"), getAllBookings);

// GET /api/bookings/:id (Retrieve confirmed booking pass by ID)
router.get("/:id", getBookingById);

export default router;
