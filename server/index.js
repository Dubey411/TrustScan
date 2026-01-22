import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from 'url';
import connectDB from "./config/db.js";
import scanRoute from "./routes/scan.js";
import { initializeMLAutomation } from "./services/mlManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('🛡️ [Startup] Checking GOOGLE_CREDENTIALS_JSON...');
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  console.log(`🛡️ [Startup] Found credentials. Length: ${process.env.GOOGLE_CREDENTIALS_JSON.length}`);
} else {
  console.warn('⚠️ [Startup] GOOGLE_CREDENTIALS_JSON not found in environment.');
}

const app = express();

// Connect to Database & Initialize Services
await connectDB();
initializeMLAutomation();

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use(cors());
app.use(express.json());

app.use("/api", scanRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [ID: ${Date.now()}]`);
});
