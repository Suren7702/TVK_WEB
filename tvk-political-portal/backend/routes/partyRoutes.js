// routes/partyRoutes.js
import express from "express";
import { checkApiKey } from "../server.js"; 
// Import the actual controller function that saves the data
import { getPartyNetwork, addPartyUnit, updatePartyUnit, deletePartyUnit } from "../controllers/partyController.js"; 

const router = express.Router();

// 🛑 FIX: Route path is ONLY "/add" 
// Full Path: POST /api/party-network/add
router.post("/add", checkApiKey, addPartyUnit);


// Full Path: GET /api/party-network/all
router.get("/all", checkApiKey, getPartyNetwork);

// Full Path: GET /api/party-network/:id
router.get("/:id", checkApiKey, getPartyNetwork); // Assuming this is fine for now

// Full Path: PUT /api/party-network/:id
router.put("/:id", checkApiKey, updatePartyUnit);

// Full Path: DELETE /api/party-network/:id
router.delete("/:id", checkApiKey, deletePartyUnit);


export default router;