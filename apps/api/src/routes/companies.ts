import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { prisma } from "@grantbr/database";

export const companiesRouter: ExpressRouter = Router();

// GET /api/companies/:id - Get company
companiesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        projects: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
