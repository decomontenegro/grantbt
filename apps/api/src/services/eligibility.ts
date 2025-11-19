import { prisma } from "@grantbr/database";

interface EligibilityResult {
  eligible: boolean;
  criteria: CriteriaCheck[];
  blockers: string[];
  warnings: string[];
}

interface CriteriaCheck {
  name: string;
  description: string;
  passed: boolean;
  required: boolean;
}

/**
 * ELIGIBILITY AGENT
 * Checks if a company is eligible for a grant based on criteria
 */
export async function checkEligibility(
  companyId: string,
  grantId: string
): Promise<EligibilityResult> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { projects: true },
  });

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!company || !grant) {
    throw new Error("Company or Grant not found");
  }

  const criteria: CriteriaCheck[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Parse grant criteria
  const grantCriteria = grant.eligibilityCriteria as any || {};

  // 1. Company size check
  if (grantCriteria.companySize) {
    const passed = grantCriteria.companySize.includes(company.size);
    criteria.push({
      name: "Porte da Empresa",
      description: `Empresa deve ser: ${grantCriteria.companySize.join(", ")}`,
      passed,
      required: true,
    });

    if (!passed) {
      blockers.push(`Porte da empresa (${company.size}) não atende aos requisitos`);
    }
  }

  // 2. Location check (if required)
  if (grantCriteria.states && grantCriteria.states.length > 0) {
    const passed = company.state ? grantCriteria.states.includes(company.state) : false;
    criteria.push({
      name: "Localização",
      description: `Empresa deve estar em: ${grantCriteria.states.join(", ")}`,
      passed,
      required: true,
    });

    if (!passed) {
      blockers.push(`Estado (${company.state}) não elegível para este grant`);
    }
  }

  // 3. Sector check (if specified)
  if (grantCriteria.sectors && grantCriteria.sectors.length > 0) {
    const passed = company.sector ?
      grantCriteria.sectors.some((s: string) =>
        company.sector!.toLowerCase().includes(s.toLowerCase())
      ) : false;

    criteria.push({
      name: "Setor de Atuação",
      description: `Setores elegíveis: ${grantCriteria.sectors.join(", ")}`,
      passed,
      required: true,
    });

    if (!passed) {
      blockers.push(`Setor (${company.sector}) não está na lista de setores elegíveis`);
    }
  }

  // 4. Minimum revenue (if applicable)
  if (grantCriteria.minRevenue) {
    const profileData = company.profileData as any || {};
    const revenue = profileData.revenue || 0;

    const passed = revenue >= grantCriteria.minRevenue;

    criteria.push({
      name: "Faturamento Mínimo",
      description: `Faturamento anual mínimo de R$ ${grantCriteria.minRevenue.toLocaleString()}`,
      passed,
      required: true,
    });

    if (!passed) {
      blockers.push("Faturamento abaixo do mínimo exigido");
    }
  }

  // 5. Innovation readiness
  const hasProjects = (company.projects?.length || 0) > 0;
  criteria.push({
    name: "Prontidão para Inovação",
    description: "Empresa possui projetos de P&D ou inovação",
    passed: hasProjects,
    required: false,
  });

  if (!hasProjects) {
    warnings.push("Nenhum projeto de P&D cadastrado. Adicione projetos para melhorar sua candidatura.");
  }

  // 6. Team qualification
  const profileData = company.profileData as any || {};
  const hasQualifiedTeam = (profileData.teamInfo?.phdCount || 0) > 0 ||
                          (profileData.teamInfo?.mastersCount || 0) > 0;

  criteria.push({
    name: "Equipe Qualificada",
    description: "Equipe com doutores ou mestres",
    passed: hasQualifiedTeam,
    required: false,
  });

  if (!hasQualifiedTeam) {
    warnings.push("Considere incluir informações sobre qualificações da equipe (mestres/doutores)");
  }

  // 7. Previous grant experience
  const hasPastGrants = profileData.pastGrants && profileData.pastGrants.length > 0;

  criteria.push({
    name: "Experiência com Grants",
    description: "Empresa já recebeu ou se candidatou a grants anteriormente",
    passed: hasPastGrants,
    required: false,
  });

  // Final eligibility
  const eligible = blockers.length === 0;

  return {
    eligible,
    criteria,
    blockers,
    warnings,
  };
}
