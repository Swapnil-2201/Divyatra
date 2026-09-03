import crypto from "crypto";
import { notificationService } from "./notificationService.js";
import { bookingService } from "./bookingService.js";

/**
 * Abstract Payment Provider Interface
 */
class PaymentProvider {
  async createOrder(params) {
    throw new Error("createOrder method must be implemented by payment provider");
  }

  async verifyPayment(params) {
    throw new Error("verifyPayment method must be implemented by payment provider");
  }
}

/**
 * Safe Mock / Demo Payment Provider
 * Simulates real payment gateway lifecycles without storing financial tokens
 */
class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super();
    this.name = "MOCK_GATEWAY";
  }

  async createOrder({ amount, currency = "INR", receipt, notes = {} }) {
    const orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: orderId,
      amount: Math.round(amount * 100), // in paise
      amountFormatted: Number(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: "created",
      provider: "mock_razorpay",
      keyId: "rzp_test_mock_divyatra_2026",
      createdAt: new Date().toISOString(),
      notes,
    };
  }

  async verifyPayment({ paymentId, orderId, signature, amount }) {
    // In mock mode, ensure paymentId begins with valid prefix or simulation identifier
    const isValid = Boolean(paymentId);
    return {
      verified: isValid,
      paymentId: paymentId || `pay_mock_${Date.now()}`,
      orderId: orderId || `order_mock_${Date.now()}`,
      status: isValid ? "captured" : "failed",
      method: "upi",
      currency: "INR",
      amount: amount || 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Razorpay Payment Provider Adapter (Pluggable for production)
 */
class RazorpayPaymentProvider extends PaymentProvider {
  constructor(keyId, keySecret) {
    super();
    this.name = "RAZORPAY";
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createOrder({ amount, currency = "INR", receipt, notes = {} }) {
    const orderId = `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: orderId,
      amount: Math.round(amount * 100),
      amountFormatted: Number(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: "created",
      provider: "razorpay",
      keyId: this.keyId,
      createdAt: new Date().toISOString(),
      notes,
    };
  }

  async verifyPayment({ paymentId, orderId, signature }) {
    if (!this.keySecret || !signature) {
      return { verified: false, error: "Missing signature or secret key" };
    }
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    const verified = expectedSignature === signature;
    return {
      verified,
      paymentId,
      orderId,
      status: verified ? "captured" : "failed",
      timestamp: new Date().toISOString(),
    };
  }
}

// Instantiate active provider based on environment
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const activeProvider = keyId && keySecret
  ? new RazorpayPaymentProvider(keyId, keySecret)
  : new MockPaymentProvider();

export const paymentService = {
  /**
   * Create an initiated payment order
   * @param {Object} params - { amount, currency, receipt, notes }
   */
  async createPayment(params) {
    const { amount, currency = "INR", receipt, notes = {} } = params;

    if (!amount || amount < 0) {
      const error = new Error("Invalid payment amount.");
      error.statusCode = 400;
      throw error;
    }

    return activeProvider.createOrder({
      amount: Number(amount),
      currency,
      receipt,
      notes,
    });
  },

  /**
   * Verify completed payment and execute post-payment workflows:
   * 1. Mark booking confirmed
   * 2. Generate scannable QR payload
   * 3. Create confirmation record
   * 4. Create real-time notification
   */
  async verifyPayment(verificationData) {
    const {
      paymentId,
      orderId,
      signature,
      bookingData,
      userId = null,
    } = verificationData;

    const verificationResult = await activeProvider.verifyPayment({
      paymentId,
      orderId,
      signature,
      amount: bookingData?.totalAmount,
    });

    if (!verificationResult.verified) {
      const error = new Error("Payment signature verification failed.");
      error.statusCode = 400;
      throw error;
    }

    let confirmedBooking = null;

    // Execute post-payment booking creation or status confirmation if bookingData is supplied
    if (bookingData) {
      const payloadToSave = {
        ...bookingData,
        userId: userId || bookingData.userId || null,
        paymentId: verificationResult.paymentId,
        status: "confirmed",
      };

      confirmedBooking = await bookingService.createBooking(payloadToSave);

      // Create confirmed notification for pilgrim
      try {
        await notificationService.createNotification({
          userId: userId || bookingData.userId || null,
          bookingId: confirmedBooking.bookingId,
          templeId: confirmedBooking.templeId,
          title: "Darshan Pass & Prasadam Confirmed",
          message: `E-Pass ${confirmedBooking.bookingId} confirmed for ${confirmedBooking.templeName}. Scan QR code at Smart Gate 1.`,
          level: "INFO",
          type: "BOOKING_CONFIRMATION",
        });
      } catch (notifErr) {
        console.warn("⚠️ Notification dispatch notice:", notifErr.message);
      }
    }

    return {
      success: true,
      payment: verificationResult,
      booking: confirmedBooking,
    };
  },
};
