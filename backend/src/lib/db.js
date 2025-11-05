import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // 🔍 Debug log
    console.log("Connecting to:", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is undefined. Check your .env file.");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
