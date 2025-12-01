// routes/partyRoutes.js
import express from "express";
import multer from "multer";
import {
  addPartyUnit,
  getPartyNetwork,
  deletePartyUnit,
  updatePartyUnit
} from "../controllers/partyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Helpful debug: show router loaded at startup ---
console.log("[routes/partyRoutes] route file loaded -", new Date().toISOString());

// Simple multer setup for potential file uploads (optional)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Small helper to wrap async route handlers and catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("[routes/partyRoutes] async handler error:", err);
    // If response already sent, just next
    if (res.headersSent) return next(err);
    return res.status(500).json({ message: "Internal server error (route)" });
  });
};

// Conditional protect middleware: set SKIP_AUTH=true to bypass auth (for quick local/dev tests only)
const skipAuth = process.env.SKIP_AUTH === "true";
const maybeProtect = (req, res, next) => {
  if (skipAuth) {
    console.log("[routes/partyRoutes] SKIP_AUTH=true -> skipping protect middleware for request:", req.method, req.originalUrl);
    return next();
  }
  return protect(req, res, next);
};

// Log every request to help debugging in production logs
router.use((req, res, next) => {
  console.log(`[routes/partyRoutes] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// GET all network
router.get("/", asyncHandler(getPartyNetwork));

// --- TEMP: Unprotected test endpoint to verify routing works ---
router.post("/add-test", (req, res) => {
  console.log("[routes/partyRoutes] received /add-test POST", {
    headersSample: Object.keys(req.headers).slice(0, 10),
    bodySample: typeof req.body === "object" ? Object.keys(req.body).slice(0, 10) : typeof req.body
  });
  return res.status(200).json({ ok: true, message: "add-test reached" });
});

// --- DEV: helper route that bypasses auth when SKIP_AUTH=true ---
// Use only for testing. In production SKIP_AUTH should be unset/false.
if (skipAuth) {
  router.post("/add-dev", upload.single("photo"), asyncHandler(addPartyUnit));
}

// Allow POST to either / (preferred) OR /add (legacy) so both client variants work.
// Keep protect middleware in place for real endpoints.
router.post("/", maybeProtect, upload.single("photo"), asyncHandler(addPartyUnit));
router.post("/add", maybeProtect, upload.single("photo"), asyncHandler(addPartyUnit));

// Also handle other HTTP methods on "/add" during debugging so you can see what's being called
router.all("/add", (req, res, next) => {
  console.log(`[routes/partyRoutes] fallback handler hit: ${req.method} ${req.originalUrl}`);
  // OPTIONS should be handled by CORS (204 is fine)
  if (req.method === "OPTIONS") return res.sendStatus(204);
  // allow other middleware/handlers to run for PUT/DELETE/GET
  if (["PUT", "DELETE", "PATCH", "GET"].includes(req.method)) return next();
  return res.status(405).json({ message: `Method ${req.method} on /api/party-network/add not allowed (debug fallback)` });
});

// Update & delete
router.put("/:id", maybeProtect, asyncHandler(updatePartyUnit));
router.delete("/:id", maybeProtect, asyncHandler(deletePartyUnit));

export default router;
