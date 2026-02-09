import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    try {
        // Option 1: Using private key file (Preferred for Production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            admin.initializeApp({
                credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
            });
            console.log("🛡️ [Auth] Firebase Admin initialized using cert file.");
        } 
        // Option 2: Fallback for local development or encoded strings
        else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log("🛡️ [Auth] Firebase Admin initialized using applicationDefault.");
        }
    } catch (error) {
        console.error("❌ [Auth] Firebase Admin initialization failed:", error.message);
    }
}

/**
 * Middleware: verifyAdmin
 * Blocks anyone who is NOT the designated admin email.
 */
export const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Missing token" });
        }

        const token = authHeader.split("Bearer ")[1];
        
        // 1. Verify the Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // 2. Check explicitly for your admin email
        const ADMIN_EMAIL = 'trustscan.ai@gmail.com';
        
        if (decodedToken.email !== ADMIN_EMAIL) {
            console.warn(`🚨 [Security] Unauthorized Admin Access Attempt by: ${decodedToken.email}`);
            return res.status(403).json({ 
                error: "Forbidden: You do not have admin privileges.",
                details: "Access restricted to trustscan.ai@gmail.com"
            });
        }

        // Attach user info for tracing
        req.adminUser = decodedToken;
        next();
    } catch (error) {
        console.error("❌ [Security] Admin Verification Error:", error.message);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};
