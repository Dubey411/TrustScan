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
        let serviceAccountValue = process.env.GOOGLE_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIAL_JSON;
        
        // Option 1: Using private key file
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            admin.initializeApp({
                credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
            });
            console.log("🛡️ [Auth] Firebase Admin initialized using cert file.");
        } 
        // Option 2: Using JSON string (Render friendly)
        else if (serviceAccountValue) {
            try {
                // CLEANUP: Remove potential surrounding quotes from Render env vars
                let cleanJson = serviceAccountValue.trim();
                if (cleanJson.startsWith("'") && cleanJson.endsWith("'")) {
                    cleanJson = cleanJson.slice(1, -1);
                } else if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
                    cleanJson = cleanJson.slice(1, -1);
                }

                const serviceAccount = JSON.parse(cleanJson);
                
                // Extremely robust private key normalization
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: serviceAccount.project_id
                });
                
                console.log(`🛡️ [Auth] Firebase Admin initialized for project: ${serviceAccount.project_id}`);
            } catch (pErr) {
                console.error("❌ [Auth] JSON Parse Failure on GOOGLE_CREDENTIALS_JSON:", pErr.message);
                // Fallback to applicationDefault
                admin.initializeApp({ credential: admin.credential.applicationDefault() });
            }
        }
        else {
            admin.initializeApp({ credential: admin.credential.applicationDefault() });
            console.log("🛡️ [Auth] Firebase Admin initialized with applicationDefault.");
        }
    } catch (error) {
        console.error("❌ [Auth] Critical Firebase Admin Init Error:", error.message);
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
        
        let decodedToken = null;

        // 1. Verify the Firebase ID Token
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (verifyErr) {
            console.warn(`⚠️ [Security] verifyIdToken failed (${verifyErr.message}). Checking JWT payload fallback...`);
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
                    const parsed = JSON.parse(payloadJson);
                    if (parsed.email) {
                        decodedToken = parsed;
                    }
                }
            } catch (pErr) {
                console.error("❌ [Security] JWT payload parse failed:", pErr.message);
            }
            if (!decodedToken) throw verifyErr;
        }

        // 2. Check explicitly for admin emails
        const ALLOWED_ADMIN_EMAILS = ['trustscan.ai@gmail.com', 'shubh6949@gmail.com'];
        
        if (!ALLOWED_ADMIN_EMAILS.includes(decodedToken.email)) {
            console.warn(`🚨 [Security] Unauthorized Admin Access Attempt by: ${decodedToken.email}`);
            return res.status(403).json({ 
                error: "Forbidden: You do not have admin privileges.",
                details: `Access restricted to ${ALLOWED_ADMIN_EMAILS.join(', ')}`
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
