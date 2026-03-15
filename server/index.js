import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from 'url';
import https from "https";
import connectDB from "./config/db.js";
import scanRoute from "./routes/scan.js";
import adminRoute from "./routes/admin.js";
import { initializeMLAutomation } from "./services/ml/mlManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.error('CRASH (Uncaught Exception):', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRASH (Unhandled Rejection):', reason);
});

const app = express();

// Connect to Database & Initialize Services
await connectDB();
initializeMLAutomation();

const SERVER_ID = Date.now();

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString(), serverId: SERVER_ID });
});

// Middlewares
app.use(cors({
  origin: ["https://www.trustscanai.in", "https://trustscanai.in", "http://localhost:3000", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());


app.use("/api/admin", adminRoute);
app.use("/api", scanRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [ID: ${Date.now()}]`);
  
  // 🔥 PERFORMANCE: Self-pinging mechanism to bypass Render's 15-min sleep timer.
  // This ensures the server stays "warm" and eliminates the ~50s cold start.
  const BACKEND_URL = "https://checkit-server.onrender.com/";
  setInterval(() => {
    https.get(BACKEND_URL, (res) => {
      console.log(`[Self-Ping] Status: ${res.statusCode} (Keeping server warm)`);
    }).on('error', (err) => {
      console.error(`[Self-Ping] Error: ${err.message}`);
    });
  }, 14 * 60 * 1000); // Ping every 14 minutes
});
      