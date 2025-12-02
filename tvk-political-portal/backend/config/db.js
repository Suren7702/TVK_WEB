// config/db.js
import mongoose from "mongoose";

/**
 * connectDB(mongoURI?)
 * - Attempts to connect to MongoDB, retrying a few times for transient failures.
 * - Does NOT call process.exit() so the caller (server.js) can decide how to handle failures.
 *
 * Usage:
 *   await connectDB(); // reads from env
 *   // or
 *   await connectDB(process.env.MONGO_URI);
 */
const connectDB = async (mongoURI) => {
  const uri =
    mongoURI ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!uri) {
    throw new Error(
      "MongoDB URI not found. Set one of: MONGO_URI, MONGO_URL, MONGODB_URI, DATABASE_URL"
    );
  }

  // Fail fast: do not silently buffer model operations while disconnected.
  // If you'd rather allow buffering, remove or set to true.
  mongoose.set("bufferCommands", false);

  // Connection options
  const opts = {
    // Mongoose 6+ uses sensible defaults; include timeouts we care about.
    serverSelectionTimeoutMS: 10000, // how long to try selecting a server (10s)
    socketTimeoutMS: 45000,
    // family: 4 forces IPv4 if you have IPv6/DNS issues; remove if not needed
    family: 4,
    // autoIndex: false, // consider disabling in production for performance
  };

  const maxRetries = 3;
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      attempt++;
      if (attempt === 1) console.log("Connecting to MongoDB...");
      else console.log(`MongoDB reconnect attempt ${attempt}...`);

      await mongoose.connect(uri, opts);
      console.log("✅ MongoDB connected");
      return mongoose;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      console.error(`MongoDB connection attempt ${attempt} failed:`, msg);

      if (attempt > maxRetries) {
        // Give up after retries — throw so caller can decide to exit or retry differently
        throw new Error(
          `Unable to connect to MongoDB after ${maxRetries + 1} attempts: ${msg}`
        );
      }

      // Backoff before retrying (exponential-ish)
      const delayMs = 2000 * attempt;
      console.log(`Waiting ${delayMs}ms before retrying...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
};

export default connectDB;
