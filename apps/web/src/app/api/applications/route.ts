import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@grantbr/database";

/**
 * GET /api/applications
 * Lista todas as candidaturas da empresa do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const userCompany = await prisma.companyMember.findFirst({
      where: { userId: (session.user as any).id },
      include: {
        company: true,
      },
    });

    if (!userCompany?.company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Fetch all applications from this company
    const applications = await prisma.application.findMany({
      where: {
        companyId: userCompany.company.id,
      },
      include: {
        grant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedApplications = applications.map((app: any) => ({
      id: app.id,
      status: app.status,
      matchScore: app.matchScore,
      requestedAmount: app.requestedAmount?.toString() || null,
      approvedAmount: app.approvedAmount?.toString() || null,
      submittedAt: app.submittedAt?.toISOString() || null,
      approvedAt: app.approvedAt?.toISOString() || null,
      rejectedAt: app.rejectedAt?.toISOString() || null,
      rejectionReason: app.rejectionReason,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      grant: {
        id: app.grant.id,
        title: app.grant.title,
        agency: app.grant.agency,
        category: app.grant.category,
        valueMin: app.grant.valueMin?.toString() || null,
        valueMax: app.grant.valueMax?.toString() || null,
        deadline: app.grant.deadline?.toISOString() || null,
        status: app.grant.status,
      },
    }));

    return NextResponse.json({
      applications: formattedApplications,
    });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Cria uma nova candidatura
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const userCompany = await prisma.companyMember.findFirst({
      where: { userId: (session.user as any).id },
      include: {
        company: true,
      },
    });

    if (!userCompany?.company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { grantId, matchScore } = body;

    if (!grantId) {
      return NextResponse.json(
        { error: "Grant ID is required" },
        { status: 400 }
      );
    }

    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Grant not found" },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        companyId_grantId: {
          companyId: userCompany.company.id,
          grantId: grantId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already exists for this grant" },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        companyId: userCompany.company.id,
        grantId: grantId,
        status: "DRAFT",
        matchScore: matchScore || null,
      },
      include: {
        grant: true,
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        matchScore: application.matchScore,
        createdAt: application.createdAt.toISOString(),
        grant: {
          id: application.grant.id,
          title: application.grant.title,
          agency: application.grant.agency,
        },
      },
    });
  } catch (error: any) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application", details: error.message },
      { status: 500 }
    );
  }
}
