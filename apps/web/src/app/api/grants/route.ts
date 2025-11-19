import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@grantbr/database";
import type { CompanyProfile, GrantEligibilityCriteria } from "@grantbr/database/src/types";

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

    // Fetch all open grants
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

    // If user has a company, calculate match scores
    let grantsWithScores = grants.map((grant) => {
      let matchScore = 0;
      let matchReasons: string[] = [];

      if (userCompany?.company) {
        const matchResult = calculateMatchScore(userCompany.company, grant);
        matchScore = matchResult.score;
        matchReasons = matchResult.reasons;
      }

      return {
        id: grant.id,
        title: grant.title,
        agency: grant.agency,
        category: grant.category,
        description: grant.description,
        url: grant.url,
        valueMin: grant.valueMin?.toString() || null,
        valueMax: grant.valueMax?.toString() || null,
        currency: grant.currency,
        deadline: grant.deadline?.toISOString() || null,
        status: grant.status,
        keywords: grant.keywords,
        matchScore,
        matchReasons,
      };
    });

    // Sort by match score descending
    grantsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      grants: grantsWithScores,
      hasCompany: !!userCompany?.company,
    });
  } catch (error: any) {
    console.error("Error fetching grants:", error);
    return NextResponse.json(
      { error: "Failed to fetch grants", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate match score between company and grant
 * Score breakdown (0-100+):
 * - Company size eligibility: 20 points
 * - Max employees check: +5 points (or -10 penalty)
 * - Location match: 15 points
 * - Budget range alignment: 15 points
 * - Sector/keyword match: 20 points
 * - R&D themes match: 15 points
 * - Revenue eligibility: 15 points
 * - Years of operation: +10 points (or -15 penalty)
 * - Counterpart capacity: 10 points
 * - Partnership requirements: 5 points
 * - Innovation indicators (patents): up to 5 bonus points
 */
function calculateMatchScore(company: any, grant: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const criteria = grant.eligibilityCriteria as GrantEligibilityCriteria | null;
  const profile = company.profileData as CompanyProfile | null;

  if (!criteria) {
    // No eligibility criteria means everyone can apply
    reasons.push("✅ Grant aberto para todas as empresas");
    return { score: 75, reasons }; // Baseline score
  }

  // 1. Company Size Match (20 points)
  if (criteria.companySize && company.size) {
    if (criteria.companySize.includes(company.size)) {
      score += 20;
      const sizeLabels: Record<string, string> = {
        MICRO: "Microempresa",
        SMALL: "Pequena empresa",
        MEDIUM: "Média empresa",
        LARGE: "Grande empresa"
      };
      reasons.push(`✅ Porte da empresa (${sizeLabels[company.size] || company.size}) é elegível`);
    } else {
      reasons.push(`⚠️ Porte da empresa pode não ser ideal para este grant`);
    }
  } else {
    score += 10; // Partial credit if no size restriction
  }

  // 1.1. Max Employees Check (for grants like FAPESP PIPE)
  if (criteria.maxEmployees && company.employeeCount) {
    const empCount = parseInt(company.employeeCount.toString());
    if (empCount <= criteria.maxEmployees) {
      score += 5;
      reasons.push(`✅ Número de funcionários (${empCount}) dentro do limite (máx: ${criteria.maxEmployees})`);
    } else {
      score -= 10; // Penalty for exceeding limit
      reasons.push(`❌ Empresa excede limite de ${criteria.maxEmployees} funcionários`);
    }
  }

  // 2. Location Match (15 points)
  if (criteria.states && company.state) {
    if (criteria.states.includes(company.state)) {
      score += 15;
      reasons.push(`✅ Localização (${company.state}) atende aos requisitos geográficos`);
    } else {
      reasons.push(`❌ Grant restrito a outros estados (${criteria.states.join(", ")})`);
    }
  } else {
    score += 10; // Partial credit if no location restriction
    if (!criteria.states) {
      reasons.push("✅ Sem restrição geográfica");
    }
  }

  // 3. Budget Alignment (15 points)
  if (grant.valueMin && grant.valueMax && company.annualRevenue) {
    const grantMin = parseFloat(grant.valueMin.toString());
    const grantMax = parseFloat(grant.valueMax.toString());
    const revenue = parseFloat(company.annualRevenue.toString());

    // Company should have revenue proportional to grant size
    if (revenue >= grantMin * 0.5 && revenue <= grantMax * 10) {
      score += 15;
      const formatCurrency = (val: number) => {
        if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
        return `R$ ${val.toLocaleString("pt-BR")}`;
      };
      reasons.push(`✅ Faturamento compatível com faixa do grant (${formatCurrency(grantMin)} - ${formatCurrency(grantMax)})`);
    } else if (revenue >= grantMin * 0.2) {
      score += 8;
      reasons.push(`⚠️ Faturamento abaixo do ideal, mas ainda pode candidatar-se`);
    } else {
      reasons.push(`⚠️ Faturamento pode estar fora da faixa ideal do grant`);
    }
  } else {
    score += 8;
  }

  // 4. Sector/Keyword Match (20 points)
  if (criteria.prioritySectors && company.sector) {
    const sectorMatch = criteria.prioritySectors.some((sector) =>
      company.sector.toLowerCase().includes(sector.toLowerCase()) ||
      sector.toLowerCase().includes(company.sector.toLowerCase())
    );
    if (sectorMatch) {
      score += 20;
      reasons.push(`✅ Setor de atuação (${company.sector}) é prioridade neste grant`);
    } else {
      score += 5; // Partial credit
      reasons.push(`⚠️ Setor não é prioridade (setores prioritários: ${criteria.prioritySectors.slice(0, 2).join(", ")}${criteria.prioritySectors.length > 2 ? "..." : ""})`);
    }
  } else {
    score += 10;
    if (!criteria.prioritySectors) {
      reasons.push("✅ Sem restrição de setor");
    }
  }

  // 4.1. CNAE Match (25 points) - CRITICAL for Brazilian grants
  if (criteria.cnaeCodes && profile?.cnaes && profile.cnaes.length > 0) {
    const companyCnaes = profile.cnaes.map(c => c.code);
    const primaryCnae = profile.cnaes.find(c => c.isPrimary);

    // Check for exact match with primary CNAE
    if (primaryCnae && criteria.cnaeCodes.includes(primaryCnae.code)) {
      score += 25;
      reasons.push(`✅ Seu CNAE principal (${primaryCnae.code}) é elegível para este edital`);
    }
    // Check for exact match with secondary CNAEs
    else if (companyCnaes.some(c => criteria.cnaeCodes.includes(c))) {
      score += 15;
      const matchedCnae = companyCnaes.find(c => criteria.cnaeCodes.includes(c));
      reasons.push(`✅ Um de seus CNAEs secundários (${matchedCnae}) é elegível`);
    }
    // Check for division/group match (e.g., 62.* matches 62.01-5-01)
    else {
      const divisionMatch = criteria.cnaeCodes.some(grantCnae => {
        const division = grantCnae.split('.')[0];
        return companyCnaes.some(c => c.startsWith(division));
      });
      if (divisionMatch) {
        score += 10;
        reasons.push(`⚠️ CNAE na mesma divisão, mas verifique os requisitos específicos do edital`);
      } else {
        score -= 20;
        reasons.push(`❌ Seu CNAE não está na lista de elegíveis - CNAEs aceitos: ${criteria.cnaeCodes.slice(0, 3).join(", ")}${criteria.cnaeCodes.length > 3 ? "..." : ""}`);
      }
    }
  } else if (criteria.cnaeCodes && (!profile?.cnaes || profile.cnaes.length === 0)) {
    score += 5; // Small credit but warn
    reasons.push(`⚠️ Este grant especifica CNAEs elegíveis - adicione seus CNAEs no perfil`);
  } else {
    score += 12; // Partial credit when no CNAE restriction
  }

  // 4.2. Excluded CNAEs (blocker)
  if (criteria.excludedActivities && profile?.cnaes && profile.cnaes.length > 0) {
    const hasExcluded = profile.cnaes.some(c => criteria.excludedActivities!.includes(c.code));
    if (hasExcluded) {
      score -= 50;
      reasons.push(`❌ BLOQUEIO: Seu CNAE está na lista de atividades excluídas deste grant`);
    }
  }

  // 4.3. R&D Themes Match (15 points) - Important for FAPESP PIPE and similar
  if (criteria.priorityThemes && profile?.rdThemes && profile.rdThemes.length > 0) {
    const themeMatches = criteria.priorityThemes.filter((grantTheme) =>
      profile.rdThemes.some((companyTheme: string) =>
        grantTheme.toLowerCase().includes(companyTheme.toLowerCase()) ||
        companyTheme.toLowerCase().includes(grantTheme.toLowerCase())
      )
    );

    if (themeMatches.length > 0) {
      const matchPoints = Math.min(15, themeMatches.length * 5); // 5 points per theme match, max 15
      score += matchPoints;
      if (themeMatches.length === 1) {
        reasons.push(`✅ Tema de P&D alinhado: ${themeMatches[0]}`);
      } else {
        reasons.push(`✅ ${themeMatches.length} temas de P&D alinhados com o grant`);
      }
    } else {
      score += 3; // Small credit for having themes defined
      reasons.push(`⚠️ Temas de P&D da empresa não coincidem com prioridades do grant`);
    }
  } else if (criteria.priorityThemes && (!profile?.rdThemes || profile.rdThemes.length === 0)) {
    reasons.push(`⚠️ Grant prioriza temas específicos de P&D - complete seu perfil para melhor matching`);
  } else if (!criteria.priorityThemes) {
    score += 8; // Partial credit when no theme restriction
  }

  // 5. Revenue Eligibility (15 points)
  if (company.annualRevenue) {
    const revenue = parseFloat(company.annualRevenue.toString());
    const meetsMin = !criteria.minRevenue || revenue >= criteria.minRevenue;
    const meetsMax = !criteria.maxRevenue || revenue <= criteria.maxRevenue;

    if (meetsMin && meetsMax) {
      score += 15;
      if (criteria.minRevenue || criteria.maxRevenue) {
        reasons.push("✅ Faturamento dentro dos limites de elegibilidade");
      }
    } else if (meetsMin || meetsMax) {
      score += 5;
      if (!meetsMin) {
        const formatCurrency = (val: number) => {
          if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
          return `R$ ${val.toLocaleString("pt-BR")}`;
        };
        reasons.push(`⚠️ Faturamento abaixo do mínimo exigido (${formatCurrency(criteria.minRevenue || 0)})`);
      } else {
        reasons.push("⚠️ Faturamento acima do máximo permitido");
      }
    }
  } else {
    score += 5;
  }

  // 5.1. Years of Operation Check (CRITICAL for FINEP and EMBRAPII)
  if (criteria.minYearsOperation && company.foundationDate) {
    const foundationDate = new Date(company.foundationDate);
    const now = new Date();
    const yearsOperation = (now.getTime() - foundationDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (yearsOperation >= criteria.minYearsOperation) {
      score += 10;
      reasons.push(`✅ Empresa tem ${Math.floor(yearsOperation)} anos (mínimo: ${criteria.minYearsOperation} anos)`);
    } else {
      score -= 15; // Strong penalty for not meeting age requirement
      reasons.push(`❌ Empresa precisa ter pelo menos ${criteria.minYearsOperation} anos de operação`);
    }
  }

  // 6. Counterpart Capacity (10 points)
  if (criteria.counterpartRequired && profile?.financial) {
    if (profile.financial.hasCounterpartCapacity) {
      const canMeet = profile.financial.typicalCounterpart >= (criteria.counterpartPercentage || 0);
      if (canMeet) {
        score += 10;
        reasons.push(`✅ Empresa tem capacidade de contrapartida (${criteria.counterpartPercentage}% requerido)`);
      } else {
        score += 5;
        reasons.push(`⚠️ Contrapartida requerida de ${criteria.counterpartPercentage}% pode ser desafiadora`);
      }
    } else {
      reasons.push(`❌ Grant requer contrapartida de ${criteria.counterpartPercentage}%`);
    }
  } else if (!criteria.counterpartRequired) {
    score += 10;
    reasons.push("✅ Não requer contrapartida financeira");
  }

  // 7. Partnership Requirements (5 points)
  if (criteria.requiredPartners && profile?.partnerships) {
    const hasEmbrapii = criteria.requiredPartners.includes("EMBRAPII_UNIT") &&
      (profile.partnerships.embrapiiUnits?.length || 0) > 0;

    if (hasEmbrapii || !criteria.requiredPartners.length) {
      score += 5;
      if (hasEmbrapii) {
        reasons.push("✅ Empresa já possui parceria com unidade EMBRAPII");
      }
    } else {
      if (criteria.requiredPartners.includes("EMBRAPII_UNIT")) {
        reasons.push("⚠️ Requer parceria com unidade EMBRAPII");
      }
    }
  } else {
    score += 5;
    if (!criteria.requiredPartners || criteria.requiredPartners.length === 0) {
      reasons.push("✅ Não requer parcerias obrigatórias");
    }
  }

  // 8. Innovation Indicators - Patent Bonus (up to 5 points)
  if (profile?.patents) {
    const totalPatents = (profile.patents.registered || 0) + (profile.patents.pending || 0);
    if (totalPatents > 0) {
      const patentBonus = Math.min(5, totalPatents); // 1 point per patent, max 5
      score += patentBonus;
      const patentText = totalPatents === 1 ? "1 patente" : `${totalPatents} patentes`;
      reasons.push(`✅ Possui ${patentText} (demonstra capacidade de inovação)`);
    }
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    reasons
  };
}
