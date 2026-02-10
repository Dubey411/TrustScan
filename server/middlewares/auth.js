import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from 'url';

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
        // Option 2: Using encoded JSON string (Render/Deployment friendly)
        else if (process.env.GOOGLE_CREDENTIAL_JSON || process.env.GOOGLE_CREDENTIALS_JSON) {
            try {
                const jsonStr = process.env.GOOGLE_CREDENTIAL_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
                const serviceAccount = JSON.parse(jsonStr);
                
                // Extremely robust private key normalization
                let pk = serviceAccount.private_key || '';
                pk = pk.replace(/\\n/g, '\n'); 
                
                // Extract base64 part and re-wrap to ensure clean headers
                const pemMatch = pk.match(/-----BEGIN PRIVATE KEY-----([\s\S]*)-----END PRIVATE KEY-----/);
                if (pemMatch) {
                    const base64Content = pemMatch[1].replace(/\s/g, '');
                    serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${base64Content}\n-----END PRIVATE KEY-----\n`;
                } else {
                    serviceAccount.private_key = pk.replace(/\\n/g, '\n');
                }

                // Temporary file strategy for better compatibility with internal Google Auth
                const tempSaPath = path.join(os.tmpdir(), "trustscan-admin-sa.json");
                fs.writeFileSync(tempSaPath, JSON.stringify(serviceAccount));
                
                // Use GOOGLE_APPLICATION_CREDENTIALS strategy
                process.env.GOOGLE_APPLICATION_CREDENTIALS = tempSaPath;
                
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: serviceAccount.project_id
                });
                
                console.log("🛡️ [Auth] Firebase Admin initialized using GOOGLE_APPLICATION_CREDENTIALS.");
            } catch (pErr) {
                console.error("❌ [Auth] Failed to initialize with GOOGLE_CREDENTIALS_JSON:", pErr.message);
                throw pErr;
            }
        }
        // Option 3: Fallback for local development
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
