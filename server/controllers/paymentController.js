import { paymentService } from "../services/paymentService.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    if (amount === undefined || amount === null) {
      return sendError(res, "Payment amount is required.", 400);
    }

    const order = await paymentService.createPayment({
      amount: Number(amount),
      currency,
      receipt,
      notes,
    });

    return sendSuccess(res, order, "Payment session initiated.", 200);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId, signature, bookingData } = req.body;

    if (!paymentId) {
      return sendError(res, "Payment ID reference is required for verification.", 400);
    }

    const result = await paymentService.verifyPayment({
      paymentId,
      orderId,
      signature,
      bookingData,
      userId: req.user?.id || req.user?._id || bookingData?.userId || null,
    });

    return sendSuccess(
      res,
      result,
      "Payment verified successfully. E-Pass and notification dispatched.",
      200
    );
  } catch (error) {
    next(error);
  }
};
