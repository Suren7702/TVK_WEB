import express from "express";
// IMPORTANT: Import the checkApiKey middleware and ensure the path is correct
// If this file is in 'routes/' and server.js is in the root, '../server.js' is correct.
import { checkApiKey } from "../server.js"; 
// Assuming your controller functions are defined here
// import { addPartyNetwork } from "../controllers/partyController.js"; 

const router = express.Router();

// --- POST /api/party-network/add Route Fix ---
// The subpath is correctly set to "/add" here.
// The route is protected by 'checkApiKey' and uses 'async' for database operations.
router.post("/api/party-network/add", checkApiKey, async (req, res) => {
    // 1. Logic Check: Ensure request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body cannot be empty." });
    }

    // 2. Extract Data
    const { networkName, founder, yearEstablished } = req.body;

    try {
        // 3. Database Operation (Placeholder)
        console.log(`Attempting to add new party network: ${networkName}`);
        
        // In a real application, you would replace the following lines with:
        // const newParty = await addPartyNetwork(req.body); 
        // Example: const newParty = await PartyModel.create(req.body);

        // 4. Send Success Response (201 Created)
        res.status(201).json({ 
            message: "Party network successfully added! (Route is now registered and active)",
            networkName: networkName,
            id: "mock_id_" + Date.now() // Return a unique mock ID
        });
    } catch (error) {
        console.error("Error adding party network:", error);
        // Respond with a 500 error for any database or server failures
        res.status(500).json({ 
            message: "Internal Server Error during network addition.",
            error: error.message 
        });
    }
});
// ----------------------------------------------------


// Securing other existing routes for consistency
router.get("/all", checkApiKey, (req, res) => {
    res.json({ message: "List of all party networks" });
});

router.get("/:id", checkApiKey, (req, res) => {
    res.json({ message: `Details for party network ID: ${req.params.id}` });
});


export default router;