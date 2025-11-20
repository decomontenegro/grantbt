import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { prisma } from "@grantbr/database";
import { runGrantCollection } from "../services/grant-scraper";

export const grantsRouter: ExpressRouter = Router();

// GET /api/grants - List all grants
grantsRouter.get("/", async (req, res) => {
  try {
    const {
      agency,
      status,
      limit = "50",
      offset = "0",
    } = req.query;

    const where: any = {};

    if (agency) where.agency = agency;
    if (status) where.status = status;

    const grants = await prisma.grant.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { deadline: "asc" },
    });

    const total = await prisma.grant.count({ where });

    res.json({
      grants,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/grants/:id - Get grant by ID
grantsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const grant = await prisma.grant.findUnique({
      where: { id },
    });

    if (!grant) {
      return res.status(404).json({ error: "Grant not found" });
    }

    res.json(grant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grants - Create grant (admin only)
grantsRouter.post("/", async (req, res) => {
  try {
    const grant = await prisma.grant.create({
      data: req.body,
    });

    res.status(201).json(grant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grants/collect - Manually trigger grant collection
grantsRouter.post("/collect", async (req, res) => {
  try {
    const useMockData = req.body.useMockData !== false; // Default to true

    console.log("\n[API] Starting manual grant collection...");
    console.log(`[API] Using mock data: ${useMockData}`);

    const results = await runGrantCollection(useMockData);

    res.json({
      success: true,
      message: "Grant collection completed",
      results: results.map((r) => ({
        source: r.source,
        grantsFound: r.grantsFound,
        grantsCreated: r.grantsCreated,
        grantsUpdated: r.grantsUpdated,
        errorCount: r.errors.length,
        errors: r.errors,
        timestamp: r.timestamp,
      })),
      summary: {
        totalSources: results.length,
        totalGrantsFound: results.reduce((sum, r) => sum + r.grantsFound, 0),
        totalGrantsCreated: results.reduce((sum, r) => sum + r.grantsCreated, 0),
        totalGrantsUpdated: results.reduce((sum, r) => sum + r.grantsUpdated, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      },
    });
  } catch (error: any) {
    console.error("[API] Grant collection error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to collect grants",
      details: error.message,
    });
  }
});
