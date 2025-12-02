// server.js (Corrected)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import adminProxy from "./routes/adminProxy.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

// new middleware imports
import requestLogger from "./middleware/requestLogger.js"; // debug logger
import checkAuth from "./middleware/checkAuth.js"; // 💡 NEW: Import the security middleware

dotenv.config();

const app = express();

// --- Basic health route (MUST be placed before any global middleware) ---
// This handles the request from App.jsx's getHealth() which calls the root URL.
app.get("/", (req, res) => {
  res.send("TVK Political Portal API running");
});
// -----------------------------------------------------------------------

// --- CORS --- (Keep this section as is)
const corsOptions = {
// ... (your existing corsOptions) ...
};

// handle preflight for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// --- Body Parsers ---
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --- DEBUG request logger ---
app.use(requestLogger);

// 💡 CRITICAL FIX: Place the security middleware BEFORE all API routes
// The checkAuth middleware will now exempt the '/' route we defined above.
app.use(checkAuth); 

// --- Register all API routes (Base paths) ---
app.use("/api/auth", authRoutes); // Auth routes should handle their own internal token logic
app.use("/api/news", newsRoutes);
app.use("/api/party-network", partyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminProxy);

// --- Start server after DB connected ---
const startServer = async () => {
// ... (your existing server start and shutdown logic) ...
};

startServer();

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at Promise:", p, "reason:", reason);
});