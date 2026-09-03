import { bookingService } from "../services/bookingService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      userId: req.user?.id || req.user?._id || req.body.userId || null,
    };

    if (!bookingData.templeId && !bookingData.templeName) {
      return sendError(res, "Temple selection is required for Darshan pass booking.", 400);
    }

    const booking = await bookingService.createBooking(bookingData);
    return sendSuccess(res, booking, "Darshan E-Pass confirmed successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      return sendError(res, `Booking with ID '${id}' not found.`, 404);
    }

    return sendSuccess(res, booking, "Booking pass retrieved successfully.");
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId;
    const email = req.user?.email || req.query.email;

    const bookings = await bookingService.getUserBookings(userId, email);
    return sendSuccess(res, bookings, "User booking history retrieved.", 200, {
      count: bookings.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { templeId } = req.query;
    const bookings = await bookingService.getAllBookings(templeId);
    return sendSuccess(res, bookings, "All bookings retrieved.", 200, {
      count: bookings.length,
    });
  } catch (error) {
    next(error);
  }
};
