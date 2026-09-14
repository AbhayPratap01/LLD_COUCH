import express from "express";
import cors from "cors";

import { createContainer } from "./config/container.js";
import { createProblemRoutes } from "./routes/problemRoutes.js";
import { createAttemptRoutes } from "./routes/attemptRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LLD Coach API is running",
  });
});

// Dependency injection
const {
  problemController,
  attemptController,
} = createContainer();

// Problem routes
app.use(
  "/api/problems",
  createProblemRoutes(problemController)
);

// Attempt routes
app.use(
  "/api/attempts",
  createAttemptRoutes(attemptController)
);

export default app;