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

// --- CORS ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://tvk-web.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-api-key"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// handle preflight for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// --- Body Parsers ---
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --- API key middleware (reusable) ---
export const checkApiKey = (req, res, next) => {
  const mySecret = process.env.API_SECRET_KEY;
  const clientKey =
    req.headers["x-api-key"] || req.query.api_key || req.headers["authorization"];

  if (!mySecret) {
    return res.status(500).json({ message: "Server misconfiguration: API key missing" });
  }

  const normalizedClientKey =
    typeof clientKey === "string" && clientKey.toLowerCase().startsWith("bearer ")
      ? clientKey.split(" ")[1]
      : clientKey;

  if (!normalizedClientKey) {
    return res.status(401).json({ message: "Unauthorized: API Key is required" });
  }

  if (normalizedClientKey === mySecret) {
    return next();
  } else {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
};

// --- Register all routes (Base paths) ---
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/party-network", partyRoutes);
app.use("/api/events", eventRoutes);

// --- Basic health routes ---
app.get("/", (req, res) => {
  res.send("TVK Political Portal API running");
});

// --- Start server after DB connected ---
const startServer = async () => {
  try {
    // IMPORTANT: connectDB should accept/process process.env.MONGO_URI internally.
    // If your connectDB expects a uri argument, pass process.env.MONGO_URI here.
    await connectDB(); // wait for DB connection before starting server
    console.log("✅ Database connected, starting HTTP server...");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );

    // Graceful shutdown on SIGINT/SIGTERM
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Closing server...`);
      server.close(() => {
        console.log("HTTP server closed.");
        // Let connectDB or mongoose handle closing DB connection if needed in connectDB implementation
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (err) {
    console.error("Failed to start server — DB connection error:", err);
    // Exit so the process manager (Render) will restart or surface the error
    process.exit(1);
  }
};

startServer();

// Optional: log unhandled rejections so you can debug connection issues
process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at Promise:", p, "reason:", reason);
});
