// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";


dotenv.config();

const app = express();

// ---------------------------------------------
// ✅ CORS — Allows Your Vercel Frontend to Connect
// ---------------------------------------------
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://tvk-web.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-api-key"],
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// ---------------------------------------------

// --- Validate required environment variables early ---
const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error(
    "ERROR: MongoDB connection string not found. Set MONGO_URI (or MONGO_URL / DATABASE_URL) in environment variables."
  );
  process.exit(1);
}

// --- Body Parsers ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Basic health routes ---
app.get("/", (req, res) => {
  res.send("TVK Political Portal API running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "TVK Political Portal backend is running",
    time: new Date().toISOString(),
  });
});

// --- API key middleware (reusable) ---
export const checkApiKey = (req, res, next) => {
  const mySecret = process.env.API_SECRET_KEY;
  const clientKey =
    req.headers["x-api-key"] || req.query.api_key || req.headers["authorization"];

  if (!mySecret) {
    return res
      .status(500)
      .json({ message: "Server misconfiguration: API key missing" });
  }

  const normalizedClientKey =
    typeof clientKey === "string" && clientKey.toLowerCase().startsWith("bearer ")
      ? clientKey.split(" ")[1]
      : clientKey;

  if (normalizedClientKey && normalizedClientKey === mySecret) {
    return next();
  } else {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
};

// --- Register public routes ---
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/party-network", partyRoutes);
app.use("/api/events", eventRoutes);

// --- Example protected route ---
app.get("/api/your-endpoint", checkApiKey, (req, res) => {
  res.json({ message: "Hello from Secure TVK endpoint!" });
});

// --- Start server only after DB connects ---
const startServer = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await connectDB(MONGO_URI);
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err?.message || err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handlers
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
