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
console.log("[routes/partyRoutes] route file loaded");

// Simple multer setup for potential file uploads (optional)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all network
router.get("/", getPartyNetwork);

// --- TEMP: Unprotected test endpoint to verify routing works ---
// Call this with curl to confirm the server has mounted this router.
router.post("/add-test", (req, res) => {
  console.log("[routes/partyRoutes] received /add-test POST", {
    headers: req.headers,
    bodySample: typeof req.body === "object" ? Object.keys(req.body).slice(0, 10) : typeof req.body
  });
  return res.status(200).json({ ok: true, message: "add-test reached" });
});

// Allow POST to either / (preferred) OR /add (legacy) so both client variants work.
// Keep protect middleware in place for real endpoints.
router.post("/", protect, upload.single("photo"), addPartyUnit);
router.post("/add", protect, upload.single("photo"), addPartyUnit);

// Also handle other HTTP methods on "/add" during debugging so you see what's being called
router.all("/add", (req, res, next) => {
  // If the real handler already responded, this won't run — but while debugging it helps.
  console.log(`[routes/partyRoutes] fallback handler: ${req.method} /add`);
  // If this is OPTIONS preflight, reply quickly (CORS should already handle it)
  if (req.method === "OPTIONS") return res.sendStatus(204);
  // Let PUT/DELETE go through normally if they have other handlers
  if (["PUT","DELETE","PATCH","GET"].includes(req.method)) return next();
  // Otherwise, explicit message to help debugging
  return res.status(405).json({ message: `Method ${req.method} on /api/party-network/add not allowed (debug fallback)` });
});

// Update & delete
router.put("/:id", protect, updatePartyUnit);
router.delete("/:id", protect, deletePartyUnit);

export default router;
