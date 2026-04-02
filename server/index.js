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
import { runWarmupCycle } from "./services/warmup/warmupService.js";

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

// 🚀 PUBLIC PING ROUTE: Keeps the server awake and allows UptimeRobot to see a '200 OK'.
// Placed before all middlewares to ensure it remains public and fast.
app.get("/ping", (req, res) => res.status(200).send("pong"));
app.head("/ping", (req, res) => res.sendStatus(200));
app.get("/warmup", async (req, res) => {
  const status = await runWarmupCycle({ includeDocumentPipeline: req.query.deep === "1" });
  const hasErrors = Object.values(status).some((value) => typeof value === 'string' && value.startsWith('error:'));
  res.status(hasErrors ? 500 : 200).json({
    status: hasErrors ? 'partial_failure' : 'warm',
    timestamp: new Date().toISOString(),
    details: status
  });
});

// Connect to Database & Initialize Services
await connectDB();
initializeMLAutomation();

const SERVER_ID = Date.now();

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString(), serverId: SERVER_ID });
});
app.head("/", (req, res) => res.sendStatus(200));

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

  // Warm caches and parsers while the instance is alive.
  runWarmupCycle()
    .then((status) => console.log(`[Warmup] Initial warm cycle complete: ${JSON.stringify(status)}`))
    .catch((err) => console.error(`[Warmup] Initial warm cycle failed: ${err.message}`));

  // This helps only while the process is already awake.
  const BACKEND_URL = process.env.BACKEND_PUBLIC_URL || "https://checkit-server.onrender.com";
  setInterval(() => {
    https.get(`${BACKEND_URL}/ping`, (res) => {
      if (res.statusCode === 200) {
        console.log(`[Warmup Ping] Success: ${res.statusCode} (Server is warm)`);
      } else {
        console.warn(`[Warmup Ping] Warning: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error(`[Warmup Ping] Error: ${err.message}`);
    });
  }, 4 * 60 * 1000);
});
      
