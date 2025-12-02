import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import Middleware
import requestLogger from "./middleware/requestLogger.js";
import checkAuth from "./middleware/checkAuth.js";

// Import Routes (Only partyRoutes is shown as an example)
import partyRoutes from "./routes/partyRoutes.js";

dotenv.config();

const app = express();

// --- Basic Health Route (UNAUTHENTICATED) ---
app.get("/", (req, res) => {
  res.send("TVK Political Portal API running");
});

// --- CORS Configuration ---
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like curl or server-to-server)
    if (!origin) return callback(null, true);
    // allow the configured frontend or allow all in dev if FRONTEND_URL is "*"
    if (FRONTEND_URL === "*" || origin === FRONTEND_URL) return callback(null, true);
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-api-key"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Preflight handler for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// --- Body Parsers ---
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --- DEBUG request logger ---
app.use(requestLogger);

// --------------------------------------------------------------------
// STEP 1: Register UN-AUTHENTICATED Routes (MUST go before API key check)
// --------------------------------------------------------------------
app.use("/api/party-network", partyRoutes.unauthenticated);

// --------------------------------------------------------------------
// STEP 2: API Key middleware (applies to routes below)
// --------------------------------------------------------------------
const SERVER_API_KEY = (process.env.API_KEY || "").trim();

function verifyApiKey(req, res, next) {
  // Allow safe methods to proceed (GET for public fetches can still be protected if you want)
  // Here we enforce the key for all routes below this middleware.
  const headerKey = req.get("x-api-key") || req.get("X-Api-Key") || req.headers["x-api-key"];

  // Helpful debug logging (remove or lower verbosity in production)
  console.log(`[verifyApiKey] ${req.method} ${req.path} | header-present: ${!!headerKey} | server-key-present: ${!!SERVER_API_KEY}`);

  if (!SERVER_API_KEY) {
    // If server key not set, fail safely (you can change to allow in dev, but not recommended)
    console.error("API_KEY is not set in server environment (process.env.API_KEY).");
    return res.status(500).json({ message: "Server misconfiguration: API key not set." });
  }

  if (!headerKey || headerKey.trim() !== SERVER_API_KEY) {
    return res.status(403).json({ message: "Missing or invalid API Key in x-api-key header." });
  }

  return next();
}

app.use(verifyApiKey);

// --------------------------------------------------------------------
// STEP 3: Register AUTHENTICATED API routes (Require API Key + Token)
// --------------------------------------------------------------------
// After verifyApiKey middleware runs, you can run additional auth checks like checkAuth
// which can validate JWT/session tokens for admin-level routes.
app.use(checkAuth); // existing middleware that validates JWT/session tokens (if applicable)

app.use("/api/party-network", partyRoutes.authenticated);
// app.use("/api/admin", adminRoutes); // Add other authenticated routes here

// --- Global error handler (basic) ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// --- Start server after DB connected ---
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server — DB connection error:", err);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at Promise:", p, "reason:", reason);
});
