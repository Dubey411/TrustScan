import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from 'url';
import connectDB from "./config/db.js";
import scanRoute from "./routes/scan.js";
import adminRoute from "./routes/admin.js";
import { initializeMLAutomation } from "./services/mlManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const tracePath = path.join(__dirname, 'trace.log');
process.on('uncaughtException', (err) => {
  fs.appendFileSync(tracePath, `[${new Date().toISOString()}] CRASH (Uncaught): ${err.message}\n${err.stack}\n`);
  console.error('CRASH:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  fs.appendFileSync(tracePath, `[${new Date().toISOString()}] CRASH (Rejection): ${reason}\n`);
  console.error('REJECTION:', reason);
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
  origin: "*", // Allows frontend to talk to backend from any domain (Vercel, Localhost, etc.)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());


app.use("/api", scanRoute);
app.use("/api/admin", adminRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  fs.appendFileSync(tracePath, `[${new Date().toISOString()}] SERVER RESTART: Listening on port ${PORT}, PID=${process.pid}\n`);
  console.log(`🚀 Server running on port ${PORT} [ID: ${Date.now()}]`);
});
