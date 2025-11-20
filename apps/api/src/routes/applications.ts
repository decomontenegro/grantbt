import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { prisma } from "@grantbr/database";

export const applicationsRouter: ExpressRouter = Router();

// GET /api/applications - List applications
applicationsRouter.get("/", async (req, res) => {
  try {
    const { companyId, status } = req.query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      include: {
        grant: true,
        company: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications - Create application
applicationsRouter.post("/", async (req, res) => {
  try {
    const { companyId, grantId } = req.body;

    const application = await prisma.application.create({
      data: {
        companyId,
        grantId,
        status: "DRAFT",
      },
      include: {
        grant: true,
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/:id - Get application
applicationsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        grant: true,
        company: true,
        versions: true,
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/applications/:id - Update application
applicationsRouter.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { draftContent, status } = req.body;

    const application = await prisma.application.update({
      where: { id },
      data: {
        draftContent,
        status,
        updatedAt: new Date(),
      },
    });

    res.json(application);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
