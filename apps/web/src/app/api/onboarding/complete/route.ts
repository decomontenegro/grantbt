import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@grantbr/database";
import type { CompanyProfile } from "@grantbr/database/src/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    console.log("📥 Received onboarding data:", JSON.stringify(data, null, 2));

    // Build CompanyProfile structure
    const profileData: CompanyProfile = {
      financial: {
        annualRevenue: data.annualRevenue || 0,
        revenueYear: new Date().getFullYear(),
        employeeCount: data.employeeCount || 0,
        rdBudget: data.rdBudget || 0,
        rdPercentage: data.rdBudget && data.annualRevenue
          ? (data.rdBudget / data.annualRevenue) * 100
          : 0,
        hasCounterpartCapacity: data.hasCounterpartCapacity || false,
        typicalCounterpart: data.counterpartPercentage || 0,
      },
      team: {
        hasRDDepartment: data.hasRDDepartment || false,
        rdTeamSize: data.rdTeamSize || 0,
        phdCount: data.phdCount || 0,
        mastersCount: data.mastersCount || 0,
        researchersCount: data.researchersCount || 0,
      },
      experience: {
        pastGrants: (data.pastGrants || []).map((grant: any) => ({
          agency: grant.agency,
          program: grant.program,
          year: parseInt(grant.year) || new Date().getFullYear(),
          amount: parseFloat(grant.amount) || 0,
          status: grant.status as "approved" | "ongoing" | "completed" | "rejected",
        })),
        rdProjects: data.projects?.length || 0,
        yearsDoingRD: 0, // TODO: Add foundationDate field to schema if needed
      },
      partnerships: {
        universities: data.universityPartners || [],
        icts: data.ictPartners || [],
        embrapiiUnits: data.embrapiiPartners || [],
        otherPartners: [],
      },
      certifications: [],
      interests: data.interestAreas || [],
      preferences: {
        preferredFundingTypes: [],
        preferredAgencies: data.preferredAgencies || [],
        priorityThemes: [],
      },
      impact: {
        sustainabilityInitiatives: [],
        odsAlignment: [],
        socialImpact: "",
      },
    };

    // Create company
    console.log("📝 Creating company with data...");

    const companyData = {
        cnpj: data.cnpj,
        name: data.companyName,
        legalName: data.legalName || data.companyName,
        sector: data.sector,
        size: data.size,
        description: data.description,
        website: data.website || null,
        city: data.city || null,
        state: data.state || null,
        country: "BR",
        // Structured fields for direct querying
        cnaeCode: data.cnaeCode || null,
        employeeCount: data.employeeCount ? parseInt(data.employeeCount.toString()) : null,
        annualRevenue: data.annualRevenue ? parseFloat(data.annualRevenue.toString()) : null,
        // Complete profile as JSON for flexibility
        profileData: profileData as any,
        embedding: [], // Will be populated by embedding service
        onboardingCompleted: true,
        onboardingStep: 8,
        subscriptionTier: "FREE" as any,
    };

    console.log("📋 Company data to be created:", JSON.stringify(companyData, null, 2));

    const company = await prisma.company.create({ data: companyData });

    // Add user as company owner
    await prisma.companyMember.create({
      data: {
        userId: (session.user as any).id,
        companyId: company.id,
        role: "OWNER",
      },
    });

    // Create projects
    if (data.projects && data.projects.length > 0) {
      await prisma.project.createMany({
        data: data.projects.map((project: any) => ({
          companyId: company.id,
          title: project.title,
          description: project.description,
          status: project.status,
          budget: project.budget ? parseFloat(project.budget) : null,
          keywords: [], // Will be populated by AI later
          embedding: [], // Will be populated by AI later
        })),
      });
    }

    // Trigger embedding generation asynchronously (fire and forget)
    console.log(`✅ Company ${company.id} created, triggering embedding generation...`);

    // Call API to generate embedding (non-blocking)
    fetch("http://localhost:4000/api/ai/generate-embedding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "company",
        entityId: company.id,
      }),
    }).catch((error) => {
      console.error("Failed to trigger embedding generation:", error.message);
    });

    return NextResponse.json({
      companyId: company.id,
      message: "Onboarding completed successfully",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      data: error.meta,
    });
    return NextResponse.json(
      { error: "Failed to complete onboarding", details: error.message },
      { status: 500 }
    );
  }
}
