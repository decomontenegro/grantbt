import { prisma } from "@grantbr/database";
import { cosineSimilarity } from "../lib/openai";

interface GrantMatch {
  grant: any;
  score: number;
  reasons: string[];
}

/**
 * MATCHING AGENT
 * Finds compatible grants for a company using semantic and criteria-based matching
 */
export async function findMatchesForCompany(companyId: string): Promise<GrantMatch[]> {
  // Get company with projects
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { projects: true },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  // Get all open grants
  const grants = await prisma.grant.findMany({
    where: {
      status: "OPEN",
    },
  });

  // Calculate match scores
  const matches: GrantMatch[] = [];

  for (const grant of grants) {
    const score = await calculateMatchScore(company, grant);

    if (score >= 50) {
      // Only include matches above 50%
      matches.push({
        grant,
        score,
        reasons: generateMatchReasons(company, grant, score),
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, 20); // Return top 20
}

/**
 * Calculate match score between company and grant (0-100)
 */
async function calculateMatchScore(company: any, grant: any): Promise<number> {
  let score = 0;
  let maxScore = 0;

  // 1. Semantic similarity (40 points)
  if (company.embedding && grant.embedding && company.embedding.length > 0 && grant.embedding.length > 0) {
    const similarity = cosineSimilarity(company.embedding, grant.embedding);
    score += similarity * 40;
  }
  maxScore += 40;

  // 2. Sector match (20 points)
  if (company.sector && grant.category) {
    if (company.sector.toLowerCase().includes(grant.category.toLowerCase()) ||
        grant.category.toLowerCase().includes(company.sector.toLowerCase())) {
      score += 20;
    } else if (areSectorsRelated(company.sector, grant.category)) {
      score += 10;
    }
  }
  maxScore += 20;

  // 3. Budget alignment (15 points)
  const companyProjects = company.projects || [];
  if (companyProjects.length > 0 && grant.valueMin && grant.valueMax) {
    const avgBudget = companyProjects.reduce((sum: number, p: any) =>
      sum + (parseFloat(p.budget || 0)), 0) / companyProjects.length;

    const grantMin = parseFloat(grant.valueMin);
    const grantMax = parseFloat(grant.valueMax);

    if (avgBudget >= grantMin && avgBudget <= grantMax) {
      score += 15;
    } else if (avgBudget >= grantMin * 0.5 && avgBudget <= grantMax * 1.5) {
      score += 8;
    }
  }
  maxScore += 15;

  // 4. Company size eligibility (10 points)
  if (checkSizeEligibility(company.size, grant.eligibilityCriteria)) {
    score += 10;
  }
  maxScore += 10;

  // 5. Keywords overlap (15 points)
  const companyKeywords = extractCompanyKeywords(company);
  const grantKeywords = grant.keywords || [];

  if (companyKeywords.length > 0 && grantKeywords.length > 0) {
    const overlap = companyKeywords.filter((k: string) =>
      grantKeywords.some((gk: string) => gk.toLowerCase().includes(k.toLowerCase()))
    ).length;

    const overlapRatio = overlap / Math.max(companyKeywords.length, grantKeywords.length);
    score += overlapRatio * 15;
  }
  maxScore += 15;

  // Normalize to 0-100
  return Math.round((score / maxScore) * 100);
}

function areSectorsRelated(sector1: string, sector2: string): boolean {
  const relations: { [key: string]: string[] } = {
    "Tecnologia da Informação": ["Tecnologia", "TI", "Software", "Digital", "IA"],
    "Biotecnologia": ["Saúde", "Medicina", "Bio", "Farmacêutica"],
    "Energia": ["Renovável", "Sustentabilidade", "Solar", "Eólica"],
  };

  for (const [key, related] of Object.entries(relations)) {
    if (sector1.includes(key) || sector2.includes(key)) {
      return related.some(r =>
        sector1.toLowerCase().includes(r.toLowerCase()) ||
        sector2.toLowerCase().includes(r.toLowerCase())
      );
    }
  }

  return false;
}

function checkSizeEligibility(companySize: string, criteria: any): boolean {
  if (!criteria || !criteria.companySize) return true;

  const eligibleSizes = criteria.companySize;
  return eligibleSizes.includes(companySize);
}

function extractCompanyKeywords(company: any): string[] {
  const keywords: string[] = [];

  if (company.sector) keywords.push(company.sector);

  const profileData = company.profileData;
  if (profileData && profileData.interests) {
    keywords.push(...profileData.interests);
  }

  if (company.projects) {
    company.projects.forEach((p: any) => {
      if (p.keywords) keywords.push(...p.keywords);
    });
  }

  return [...new Set(keywords)];
}

function generateMatchReasons(company: any, grant: any, score: number): string[] {
  const reasons: string[] = [];

  if (score >= 80) {
    reasons.push("Altíssima compatibilidade com seu perfil");
  } else if (score >= 70) {
    reasons.push("Alta compatibilidade com seu perfil");
  }

  if (company.sector && grant.category &&
      company.sector.toLowerCase().includes(grant.category.toLowerCase())) {
    reasons.push(`Setor alinhado: ${grant.category}`);
  }

  if (grant.valueMax) {
    reasons.push(`Financiamento de até R$ ${(parseFloat(grant.valueMax) / 1000000).toFixed(1)}M`);
  }

  return reasons;
}

export async function runMatching(companyId: string) {
  console.log(`Running matching for company ${companyId}...`);

  const matches = await findMatchesForCompany(companyId);

  console.log(`Found ${matches.length} matches`);

  return matches;
}
