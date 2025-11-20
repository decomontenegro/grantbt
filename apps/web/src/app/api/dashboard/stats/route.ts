import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@grantbr/database";
import type { CompanyProfile, GrantEligibilityCriteria } from "@grantbr/database/src/types";

/**
 * Calculate comprehensive grant rating (0-100)
 * Combines multiple factors to identify the BEST grants for the company
 */
function calculateGrantRating(company: any, grant: any, matchScore: number): number {
  let rating = 0;

  // Factor 1: Match Score (40% weight) - How well the company fits
  rating += (matchScore / 100) * 40;

  // Factor 2: Grant Value (30% weight) - How valuable is the opportunity
  const valueScore = calculateValueScore(company, grant);
  rating += valueScore * 30;

  // Factor 3: Ease of Obtaining (30% weight) - How easy to get
  const easeScore = calculateEaseScore(company, grant);
  rating += easeScore * 30;

  return Math.round(rating);
}

/**
 * Calculate value score (0-1) based on grant amount relative to company size
 */
function calculateValueScore(company: any, grant: any): number {
  if (!grant.valueMax) return 0.5; // Neutral if no value specified

  const grantValue = parseFloat(grant.valueMax.toString());
  const companyRevenue = company.annualRevenue ? parseFloat(company.annualRevenue.toString()) : 0;

  // Ideal grant size is 10-50% of annual revenue
  if (companyRevenue > 0) {
    const ratio = grantValue / companyRevenue;

    if (ratio >= 0.1 && ratio <= 0.5) {
      return 1.0; // Perfect value range
    } else if (ratio >= 0.05 && ratio < 0.1) {
      return 0.8; // Good value
    } else if (ratio > 0.5 && ratio <= 1.0) {
      return 0.9; // High value but ambitious
    } else if (ratio > 1.0) {
      return 0.7; // Very ambitious but potentially transformative
    } else {
      return 0.6; // Small relative value
    }
  }

  // If no revenue data, score based on absolute grant value
  if (grantValue >= 1000000) return 1.0; // R$ 1M+
  if (grantValue >= 500000) return 0.9;  // R$ 500k+
  if (grantValue >= 250000) return 0.8;  // R$ 250k+
  if (grantValue >= 100000) return 0.7;  // R$ 100k+
  return 0.5;
}

/**
 * Calculate ease score (0-1) based on grant complexity and accessibility
 */
function calculateEaseScore(company: any, grant: any): number {
  let easeScore = 1.0;
  const criteria = grant.eligibilityCriteria as GrantEligibilityCriteria | null;
  const profile = company.profileData as CompanyProfile | null;

  if (!criteria) {
    return 0.9; // High ease if no specific criteria
  }

  let complexityPenalty = 0;

  // Penalty for each requirement type (reduces ease)
  if (criteria.companySize && criteria.companySize.length < 3) complexityPenalty += 0.05;
  if (criteria.maxEmployees) complexityPenalty += 0.05;
  if (criteria.states && criteria.states.length < 10) complexityPenalty += 0.08;
  if (criteria.cnaeCodes && criteria.cnaeCodes.length < 20) complexityPenalty += 0.1;
  if (criteria.minYearsOperation && criteria.minYearsOperation > 2) complexityPenalty += 0.1;
  if (criteria.counterpartRequired) complexityPenalty += 0.15;
  if (criteria.requiredPartners && criteria.requiredPartners.length > 0) complexityPenalty += 0.15;
  if (criteria.priorityThemes && criteria.priorityThemes.length > 0) complexityPenalty += 0.05;
  if (criteria.minRevenue || criteria.maxRevenue) complexityPenalty += 0.05;

  easeScore -= complexityPenalty;

  // Bonus for deadline proximity (sooner deadline = more urgent but also easier to prepare for established companies)
  if (grant.deadline) {
    const daysUntilDeadline = Math.ceil(
      (new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDeadline > 90) {
      easeScore += 0.1; // Plenty of time to prepare
    } else if (daysUntilDeadline > 60) {
      easeScore += 0.05; // Good time to prepare
    } else if (daysUntilDeadline < 15) {
      easeScore -= 0.15; // Very tight deadline
    }
  }

  // Bonus if company already meets key requirements
  if (criteria.requiredPartners) {
    if (criteria.requiredPartners.includes("EMBRAPII_UNIT") &&
        profile?.partnerships?.embrapiiUnits &&
        profile.partnerships.embrapiiUnits.length > 0) {
      easeScore += 0.1; // Already has required partnership
    }
  }

  if (criteria.counterpartRequired && profile?.financial?.hasCounterpartCapacity) {
    easeScore += 0.05; // Already has counterpart capacity
  }

  return Math.max(0, Math.min(1, easeScore));
}

// Same matching logic from /api/grants
function calculateMatchScore(company: any, grant: any): { score: number } {
  let score = 0;
  const criteria = grant.eligibilityCriteria as GrantEligibilityCriteria | null;
  const profile = company.profileData as CompanyProfile | null;

  if (!criteria) {
    return { score: 75 };
  }

  // Company Size Match
  if (criteria.companySize && company.size) {
    if (criteria.companySize.includes(company.size)) {
      score += 20;
    }
  } else {
    score += 10;
  }

  // Max Employees Check
  if (criteria.maxEmployees && company.employeeCount) {
    const empCount = parseInt(company.employeeCount.toString());
    if (empCount <= criteria.maxEmployees) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  // Location Match
  if (criteria.states && company.state) {
    if (criteria.states.includes(company.state)) {
      score += 15;
    }
  } else {
    score += 10;
  }

  // Budget Alignment
  if (grant.valueMin && grant.valueMax && company.annualRevenue) {
    const grantMin = parseFloat(grant.valueMin.toString());
    const grantMax = parseFloat(grant.valueMax.toString());
    const revenue = parseFloat(company.annualRevenue.toString());

    if (revenue >= grantMin * 0.5 && revenue <= grantMax * 10) {
      score += 15;
    } else if (revenue >= grantMin * 0.2) {
      score += 8;
    }
  } else {
    score += 8;
  }

  // Sector/Keyword Match
  if (criteria.prioritySectors && company.sector) {
    const sectorMatch = criteria.prioritySectors.some((sector: string) =>
      company.sector.toLowerCase().includes(sector.toLowerCase()) ||
      sector.toLowerCase().includes(company.sector.toLowerCase())
    );
    if (sectorMatch) {
      score += 20;
    } else {
      score += 5;
    }
  } else {
    score += 10;
  }

  // CNAE Match - CRITICAL for Brazilian grants
  if (criteria.cnaeCodes && profile?.cnaes && profile.cnaes.length > 0) {
    const companyCnaes = profile.cnaes.map((c: any) => c.code);
    const primaryCnae = profile.cnaes.find((c: any) => c.isPrimary);

    // Check for exact match with primary CNAE
    if (primaryCnae && criteria.cnaeCodes.includes(primaryCnae.code)) {
      score += 25;
    }
    // Check for exact match with secondary CNAEs
    else if (companyCnaes.some((c: string) => criteria.cnaeCodes!.includes(c))) {
      score += 15;
    }
    // Check for division/group match
    else {
      const divisionMatch = criteria.cnaeCodes.some((grantCnae: string) => {
        const division = grantCnae.split('.')[0];
        return companyCnaes.some((c: string) => c.startsWith(division));
      });
      if (divisionMatch) {
        score += 10;
      } else {
        score -= 20;
      }
    }
  } else if (criteria.cnaeCodes && (!profile?.cnaes || profile.cnaes.length === 0)) {
    score += 5;
  } else {
    score += 12;
  }

  // Excluded CNAEs (blocker)
  if (criteria.excludedActivities && profile?.cnaes && profile.cnaes.length > 0) {
    const hasExcluded = profile.cnaes.some((c: any) => criteria.excludedActivities!.includes(c.code));
    if (hasExcluded) {
      score -= 50;
    }
  }

  // R&D Themes Match
  if (criteria.priorityThemes && profile?.rdThemes && profile.rdThemes.length > 0) {
    const themeMatches = criteria.priorityThemes.filter((grantTheme: string) =>
      profile.rdThemes?.some((companyTheme: string) =>
        grantTheme.toLowerCase().includes(companyTheme.toLowerCase()) ||
        companyTheme.toLowerCase().includes(grantTheme.toLowerCase())
      )
    );

    if (themeMatches.length > 0) {
      const matchPoints = Math.min(15, themeMatches.length * 5);
      score += matchPoints;
    } else {
      score += 3;
    }
  } else if (!criteria.priorityThemes) {
    score += 8;
  }

  // Revenue Eligibility
  if (company.annualRevenue) {
    const revenue = parseFloat(company.annualRevenue.toString());
    const meetsMin = !criteria.minRevenue || revenue >= criteria.minRevenue;
    const meetsMax = !criteria.maxRevenue || revenue <= criteria.maxRevenue;

    if (meetsMin && meetsMax) {
      score += 15;
    } else if (meetsMin || meetsMax) {
      score += 5;
    }
  } else {
    score += 5;
  }

  // Years of Operation Check
  if (criteria.minYearsOperation && company.foundationDate) {
    const foundationDate = new Date(company.foundationDate);
    const now = new Date();
    const yearsOperation = (now.getTime() - foundationDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (yearsOperation >= criteria.minYearsOperation) {
      score += 10;
    } else {
      score -= 15;
    }
  }

  // Counterpart Capacity
  if (criteria.counterpartRequired && profile?.financial) {
    if (profile.financial.hasCounterpartCapacity && profile.financial.typicalCounterpart !== undefined) {
      const canMeet = profile.financial.typicalCounterpart >= (criteria.counterpartPercentage || 0);
      if (canMeet) {
        score += 10;
      } else {
        score += 5;
      }
    }
  } else if (!criteria.counterpartRequired) {
    score += 10;
  }

  // Partnership Requirements
  if (criteria.requiredPartners && profile?.partnerships) {
    const hasEmbrapii = criteria.requiredPartners.includes("EMBRAPII_UNIT") &&
      (profile.partnerships.embrapiiUnits?.length || 0) > 0;

    if (hasEmbrapii || !criteria.requiredPartners.length) {
      score += 5;
    }
  } else {
    score += 5;
  }

  // Innovation Indicators - Patent Bonus
  if (profile?.patents) {
    const totalPatents = (profile.patents.registered || 0) + (profile.patents.pending || 0);
    if (totalPatents > 0) {
      const patentBonus = Math.min(5, totalPatents);
      score += patentBonus;
    }
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score)))
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user's company
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!companyMember) {
      return NextResponse.json(
        { error: "No company found for user" },
        { status: 404 }
      );
    }

    const company = companyMember.company;

    // Get all open grants
    const grants = await prisma.grant.findMany({
      where: {
        status: {
          in: ["OPEN", "CLOSING_SOON"],
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    // Calculate match scores and ratings for all grants
    const grantsWithScores = grants.map((grant: any) => {
      const matchResult = calculateMatchScore(company, grant);
      const rating = calculateGrantRating(company, grant, matchResult.score);
      return {
        ...grant,
        matchScore: matchResult.score,
        rating, // Comprehensive rating (0-100)
      };
    });

    // Sort by rating (best overall grants first)
    grantsWithScores.sort((a: any, b: any) => b.rating - a.rating);

    // Get applications count
    const applicationsCount = await prisma.application.count({
      where: { companyId: company.id },
    });

    // High match grants (>= 75%)
    const highMatchGrants = grantsWithScores.filter((g: any) => g.matchScore >= 75).length;

    // Calculate average match score from top 10
    const avgMatchScore = grantsWithScores.length > 0
      ? Math.round(grantsWithScores.slice(0, 10).reduce((sum: number, g: any) => sum + g.matchScore, 0) / Math.min(grantsWithScores.length, 10))
      : 0;

    // Get next deadline from top matches
    const nextDeadlineGrant = grantsWithScores.find((g: any) => g.deadline);
    const nextDeadline = nextDeadlineGrant?.deadline
      ? {
          days: Math.ceil(
            (new Date(nextDeadlineGrant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ),
          grantName: nextDeadlineGrant.title.split(" - ")[0] || "Grant",
        }
      : { days: 0, grantName: "N/A" };

    // Get top 3 recommended grants (sorted by rating)
    const topGrants = grantsWithScores.slice(0, 3).map((grant: any) => ({
      id: grant.id,
      title: grant.title,
      agency: grant.agency,
      matchScore: grant.matchScore,
      rating: grant.rating, // Comprehensive rating
      deadline: grant.deadline ? new Date(grant.deadline).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) : "Contínuo",
      category: grant.category || "Sem categoria",
      valueMin: grant.valueMin,
      valueMax: grant.valueMax,
    }));

    return NextResponse.json({
      stats: {
        recommendedGrants: highMatchGrants,
        activeApplications: applicationsCount,
        matchScore: avgMatchScore,
        daysToDeadline: nextDeadline.days,
        deadlineGrantName: nextDeadline.grantName,
      },
      topGrants,
      companyName: company.name,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats", details: error.message },
      { status: 500 }
    );
  }
}
