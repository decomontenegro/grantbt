import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@grantbr/database";
import type { CompanyProfile } from "@grantbr/database/src/types";

/**
 * GET /api/company/profile
 * Retorna o perfil completo da empresa do usuário
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

    const company = userCompany.company;

    // Return company data with profile
    return NextResponse.json({
      id: company.id,
      cnpj: company.cnpj,
      name: company.name,
      legalName: company.legalName,
      sector: company.sector,
      size: company.size,
      description: company.description,
      website: company.website,
      city: company.city,
      state: company.state,
      country: company.country,
      foundationDate: company.foundationDate?.toISOString() || null,
      cnaeCode: company.cnaeCode,
      employeeCount: company.employeeCount?.toString() || null,
      annualRevenue: company.annualRevenue?.toString() || null,
      profileData: company.profileData as CompanyProfile | null,
      onboardingCompleted: company.onboardingCompleted,
      onboardingStep: company.onboardingStep,
    });
  } catch (error: any) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch company profile", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/profile
 * Atualiza o perfil da empresa
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

    // Extract basic company fields vs profileData fields
    const {
      name,
      legalName,
      sector,
      size,
      description,
      website,
      city,
      state,
      country,
      foundationDate,
      cnaeCode,
      employeeCount,
      annualRevenue,
      profileData,
    } = body;

    // Build update object
    const updateData: any = {};

    // Basic fields
    if (name !== undefined) updateData.name = name;
    if (legalName !== undefined) updateData.legalName = legalName;
    if (sector !== undefined) updateData.sector = sector;
    if (size !== undefined) updateData.size = size;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (foundationDate !== undefined) {
      updateData.foundationDate = foundationDate ? new Date(foundationDate) : null;
    }
    if (cnaeCode !== undefined) updateData.cnaeCode = cnaeCode;
    if (employeeCount !== undefined) {
      updateData.employeeCount = employeeCount ? BigInt(employeeCount) : null;
    }
    if (annualRevenue !== undefined) {
      updateData.annualRevenue = annualRevenue ? BigInt(annualRevenue) : null;
    }

    // ProfileData (JSON)
    if (profileData !== undefined) {
      updateData.profileData = profileData;
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: userCompany.company.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        foundationDate: updatedCompany.foundationDate?.toISOString() || null,
        employeeCount: updatedCompany.employeeCount?.toString() || null,
        annualRevenue: updatedCompany.annualRevenue?.toString() || null,
        profileData: updatedCompany.profileData as CompanyProfile | null,
      },
    });
  } catch (error: any) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Failed to update company profile", details: error.message },
      { status: 500 }
    );
  }
}
