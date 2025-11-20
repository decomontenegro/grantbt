import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { findMatchesForCompany } from "../services/matching";

export const matchingRouter: ExpressRouter = Router();

// POST /api/matching/find - Find matches for a company
matchingRouter.post("/find", async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const matches = await findMatchesForCompany(companyId);

    res.json({
      companyId,
      matches,
      count: matches.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/matching/matches/:companyId - Get matches for a company
matchingRouter.get("/matches/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const matches = await findMatchesForCompany(companyId);

    res.json(matches);
  } catch (error: any) {
    console.error("Error finding matches:", error);
    res.status(500).json({ error: error.message });
  }
});
