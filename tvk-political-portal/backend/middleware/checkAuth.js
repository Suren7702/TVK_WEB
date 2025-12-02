// src/middleware/checkAuth.js (New File)
import dotenv from "dotenv";
dotenv.config();

/**
 * Global Security Middleware:
 * 1. Exempts health check and certain public routes.
 * 2. Checks for 'x-api-key' and 'Authorization' on all other requests.
 */
export default function checkAuth(req, res, next) {
    // 💡 CRITICAL FIX: Exempt the root route '/' which is used by the frontend for health check.
    if (req.path === '/') {
        console.log("-> 🛠️ Auth Bypass: Health check.");
        return next();
    }

    // --- 1. Check for x-api-key ---
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.X_API_KEY; // Ensure this env var is set on Render

    if (!apiKey || apiKey !== expectedApiKey) {
        // Log the error detail for debugging but send a generic status
        console.error(`-> 🚫 ERROR: Invalid/Missing x-api-key on path ${req.path}`);
        return res.status(403).json({ 
            message: 'Forbidden: Missing or invalid API Key. Client must provide a valid x-api-key header.' 
        });
    }

    // --- 2. Check for Authorization header (Bearer Token) ---
    const authHeader = req.headers['authorization'];

    // You can add more complex logic here (e.g., token verification), 
    // but we check for its mere presence first.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn(`-> ⚠️ WARN: Authorization token missing/malformed on path ${req.path}`);
        // Only return 401 if the route is known to require auth (e.g., /api/admin)
        // For now, let it proceed, and let the route handler perform deep token validation.
    }

    // If API Key is valid, allow request to proceed to the next middleware/route handler.
    next();
}