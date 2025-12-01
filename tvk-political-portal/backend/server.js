// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import partyRoutes from "./routes/partyRoutes.js"; // Note: Ensure your file is named partyRoutes.js
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
app.use(cors(corsOptions));

// --- Body Parsers ---
// Increased limit for potential base64 photo uploads
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

    // 🛑 FIX: Explicitly send 401 if key is missing
    if (!normalizedClientKey) {
        return res.status(401).json({ message: "Unauthorized: API Key is required" });
    }

    if (normalizedClientKey === mySecret) {
        return next();
    } else {
        // Send 403 for invalid key
        return res.status(403).json({ message: "Forbidden: Invalid API Key" });
    }
};

// --- Register all routes (Base paths) ---
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/party-network", partyRoutes); // <-- BASE PATH IS /api/party-network
app.use("/api/events", eventRoutes);

// --- Basic health routes and start server ---
app.get("/", (req, res) => {
  res.send("TVK Political Portal API running");
});

const startServer = async () => {
    // NOTE: You need to set up connectDB and your MONGO_URI elsewhere
    // await connectDB(process.env.MONGO_URI); 

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
    );
};

startServer();