import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB Atlas if URI is provided, otherwise gracefully fallback to mock mode.
 * @returns {Promise<boolean>} connection status
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === "") {
    console.log("ℹ️ [MongoDB] MONGODB_URI not provided. Operating in Local In-Memory Fallback Mode.");
    isConnected = false;
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to Atlas Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection to Atlas failed (${error.message}). Falling back to Local Mock Mode.`);
    isConnected = false;
    return false;
  }
};

/**
 * Check whether active MongoDB connection exists
 * @returns {boolean}
 */
export const isDatabaseConnected = () => isConnected;
