import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @description Protects routes by checking for a valid JWT.
 * If valid, attaches the user object (excluding password) to req.
 */
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user and attach to request object
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                // Return structured error: User in token not found
                return res.status(401).json({ 
                    status: 401,
                    code: "AUTH_USER_NOT_FOUND",
                    message: "Authentication failed. User ID in token does not match any existing user." 
                });
            }
            
            req.user = user;
            next();
        } catch (error) {
            // Determine the specific error type for structured response
            let errorCode = "AUTH_TOKEN_FAILED";
            let message = "Not authorized. The provided token is invalid.";

            if (error.name === 'TokenExpiredError') {
                errorCode = "AUTH_TOKEN_EXPIRED";
                message = "Session expired. Please log in again.";
            } else if (error.name === 'JsonWebTokenError') {
                errorCode = "AUTH_TOKEN_INVALID";
                message = "Authentication token is malformed or invalid.";
            }
            
            // Return structured error: Token failure
            return res.status(401).json({ 
                status: 401,
                code: errorCode,
                message: message 
            });
        }
    }

    if (!token) {
        // Return structured error: No token provided
        return res.status(401).json({ 
            status: 401,
            code: "AUTH_NO_TOKEN",
            message: "Authorization token is missing. Access denied." 
        });
    }
};

/**
 * @description Restricts access only to users with the 'admin' role.
 * Must be used AFTER the protect middleware.
 */
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        // Fallback safety check (shouldn't happen if 'protect' ran first)
        return res.status(401).json({ 
            status: 401,
            code: "AUTH_PROTECT_REQUIRED",
            message: "Authentication check must run before role check." 
        });
    }

    if (req.user.role !== "admin") {
        // Return structured error: Insufficient privileges
        return res.status(403).json({ 
            status: 403,
            code: "AUTH_ROLE_DENIED",
            message: "Access denied. Only administrators can perform this action." 
        });
    }
    next();
};