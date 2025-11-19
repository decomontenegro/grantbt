import { Router } from "express";
import { checkEligibility } from "../services/eligibility";
import { generateProposal } from "../services/generator";
import { evaluateProposal } from "../services/evaluator";
import { generateEntityEmbedding } from "../jobs/embedding";

export const aiRouter = Router();

// POST /api/ai/check-eligibility - Check eligibility
aiRouter.post("/check-eligibility", async (req, res) => {
  try {
    const { companyId, grantId } = req.body;

    const result = await checkEligibility(companyId, grantId);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/generate-proposal - Generate proposal
aiRouter.post("/generate-proposal", async (req, res) => {
  try {
    const { applicationId } = req.body;

    const proposal = await generateProposal(applicationId);

    res.json({ proposal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/evaluate - Evaluate proposal
aiRouter.post("/evaluate", async (req, res) => {
  try {
    const { applicationId } = req.body;

    const evaluation = await evaluateProposal(applicationId);

    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/generate-embedding - Generate embedding for entity
aiRouter.post("/generate-embedding", async (req, res) => {
  try {
    const { type, entityId } = req.body;

    if (!type || !entityId) {
      return res.status(400).json({ error: "type and entityId are required" });
    }

    const result = await generateEntityEmbedding(type, entityId);

    res.json(result);
  } catch (error: any) {
    console.error("Error generating embedding:", error);
    res.status(500).json({ error: error.message });
  }
});
