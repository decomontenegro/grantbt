import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { grantsRouter } from "./routes/grants";
import { applicationsRouter } from "./routes/applications";
import { companiesRouter } from "./routes/companies";
import { aiRouter } from "./routes/ai";
import { matchingRouter } from "./routes/matching";
import { initializeGrantCollectionScheduler } from "./jobs/grant-collection-scheduler";

// Load environment variables from .env file
dotenv.config();

// Debug: verify OPENAI_API_KEY is loaded
if (process.env.OPENAI_API_KEY) {
  console.log("✅ OpenAI API key loaded successfully");
} else {
  console.warn("❌ OpenAI API key not found in environment");
}

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/grants", grantsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/matching", matchingRouter);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  // Initialize scheduled grant collection jobs
  initializeGrantCollectionScheduler();
});
