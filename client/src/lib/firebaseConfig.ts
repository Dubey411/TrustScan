export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Health Check for Deployment (Browser Console only)
if (typeof window !== 'undefined') {
    const missing = Object.entries(firebaseConfig)
        .filter(([_, v]) => !v || v === 'undefined')
        .map(([k]) => k);
        
    if (missing.length > 0) {
        console.error("🚨 [TrustScan Security] Authentication failure: Missing environment variables on this build.", missing);
    } else {
        console.log("🛠️ [TrustScan Security] Environment configuration healthy.");
    }
}


