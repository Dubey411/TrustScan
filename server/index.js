import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import scanRoute from "./routes/scan.js";
import { initializeMLAutomation } from "./services/mlManager.js";

dotenv.config();

const app = express();

// Connect to Database
connectDB();
initializeMLAutomation();

app.use(cors());
app.use(express.json());

app.use("/api", scanRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [ID: ${Date.now()}]`);
});
