/**
 * GrantBR - Company Profile Types
 * Structured typing for company profileData JSON field
 */

// ============================================
// COMPANY PROFILE
// ============================================

export interface CompanyProfile {
  // CNAEs (Classificação Nacional de Atividades Econômicas)
  cnaes?: Array<{
    code: string;                   // Ex: "62.01-5-01"
    description: string;            // Ex: "Desenvolvimento de software sob encomenda"
    isPrimary: boolean;             // true para CNAE principal
  }>;

  // Dados Financeiros
  financial: {
    annualRevenue: number;          // Faturamento anual em BRL
    revenueYear: number;            // Ano de referência (ex: 2024)
    employeeCount: number;           // Número de funcionários
    rdBudget?: number;              // Orçamento anual de P&D
    rdPercentage?: number;          // % da receita investida em P&D
    hasCounterpartCapacity: boolean; // Tem capacidade de contrapartida?
    typicalCounterpart?: number;    // % típica de contrapartida (0-100)
  };

  // Equipe e Capacidades
  team: {
    hasRDDepartment: boolean;       // Possui departamento/equipe de P&D?
    rdTeamSize?: number;            // Tamanho da equipe de P&D
    phdCount?: number;              // Quantidade de doutores
    mastersCount?: number;          // Quantidade de mestres
    researchersCount?: number;      // Quantidade de pesquisadores
  };

  // Temas de P&D e Estágio
  rdThemes?: string[];              // Temas de P&D que a empresa trabalha
  projectStage?: "IDEA" | "PROTOTYPE" | "MVP" | "MARKET_READY" | "SCALE"; // Estágio atual dos projetos

  // Experiência com Grants
  experience: {
    pastGrants: Array<{
      agency: string;               // Ex: "FINEP", "FAPESP"
      program: string;              // Ex: "PIPE", "Subvenção Econômica"
      year: number;                 // Ano de aprovação
      amount: number;               // Valor aprovado em BRL
      status: "approved" | "ongoing" | "completed" | "rejected";
    }>;
    rdProjects?: number;            // Número de projetos de P&D executados
    yearsDoingRD?: number;          // Anos fazendo P&D
  };

  // Parcerias
  partnerships: {
    universities?: string[];        // Ex: ["USP", "UNICAMP"]
    icts?: string[];                // Institutos de Ciência e Tecnologia
    embrapiiUnits?: string[];       // Unidades EMBRAPII parceiras
    otherPartners?: string[];       // Outras parcerias estratégicas
  };

  // Propriedade Intelectual (opcional)
  patents?: {
    registered?: number;            // Patentes registradas/concedidas
    pending?: number;               // Pedidos de patente pendentes
    softwareRegistrations?: number; // Registros de software
    trademarks?: number;            // Marcas registradas
  };

  // Certificações (opcional)
  certifications?: string[];        // Ex: ["ISO 9001", "ISO 14001"]

  // Preferências de Matching
  preferences?: {
    preferredFundingTypes?: Array<"reembolsável" | "não-reembolsável" | "equity" | "subvenção">;
    maxCounterpart?: number;        // % máxima de contrapartida disposta
    preferredAgencies?: string[];   // Agências de preferência
    priorityThemes?: string[];      // Temas prioritários de interesse
  };

  // Áreas de Interesse
  interests?: string[];             // Ex: ["Inteligência Artificial", "IoT", "Biotecnologia"]

  // Impacto Social e Ambiental (opcional)
  impact?: {
    sustainabilityInitiatives?: string[];  // Iniciativas de sustentabilidade
    odsAlignment?: number[];              // ODS da ONU (1-17)
    socialImpact?: string;                // Descrição do impacto social
  };
}

// ============================================
// GRANT ELIGIBILITY CRITERIA
// ============================================

export interface GrantEligibilityCriteria {
  // Porte da Empresa
  companySize?: Array<"MEI" | "MICRO" | "SMALL" | "MEDIUM" | "LARGE">;

  // Localização
  states?: string[];                // Estados permitidos (ex: ["SP", "RJ"])
  cities?: string[];                // Cidades específicas (raro)
  regions?: string[];               // Regiões (ex: ["Sul", "Sudeste"])

  // Setor
  sectors?: string[];               // Setores permitidos
  cnaeCodes?: string[];             // CNAEs específicos
  prioritySectors?: string[];       // Setores prioritários (score maior)
  excludedActivities?: string[];    // CNAEs excluídos

  // Financeiro
  minRevenue?: number;              // Faturamento mínimo anual (BRL)
  maxRevenue?: number;              // Faturamento máximo anual (BRL)
  minEmployees?: number;            // Número mínimo de funcionários
  maxEmployees?: number;            // Número máximo de funcionários

  // Tempo de Operação
  minYearsOperation?: number;       // Anos mínimos de existência

  // Certificações e Qualificações
  requiredCertifications?: string[]; // Ex: ["ISO 9001"]
  requiredPartners?: string[];       // Ex: ["EMBRAPII_UNIT", "ICT"]

  // Projeto e Tecnologia
  trlRange?: {                      // Technology Readiness Level
    min: number;                    // 1-9
    max: number;                    // 1-9
  };
  priorityThemes?: string[];        // Temas prioritários do edital

  // Contrapartida
  counterpartRequired?: boolean;
  counterpartPercentage?: number;   // % mínima de contrapartida

  // Outros
  maxNonReimbursable?: number;      // % máximo não-reembolsável
  fundingType?: "reembolsável" | "não-reembolsável" | "equity" | "misto";
}

// ============================================
// HELPER TYPES
// ============================================

export type CompanySize = "MEI" | "MICRO" | "SMALL" | "MEDIUM" | "LARGE";
export type GrantAgency = "FINEP" | "FAPESP" | "FAPERJ" | "FAPEMIG" | "EMBRAPII" | "SEBRAE" | "BNDES" | "CNPq" | "CAPES" | "OTHER";
export type GrantStatus = "UPCOMING" | "OPEN" | "CLOSING_SOON" | "CLOSED" | "CANCELLED";
export type ApplicationStatus = "DRAFT" | "IN_REVIEW" | "READY_TO_SUBMIT" | "SUBMITTED" | "UNDER_EVALUATION" | "APPROVED" | "REJECTED" | "CANCELLED";

// ============================================
// ELIGIBILITY CHECK RESULT
// ============================================

export interface EligibilityCheckResult {
  eligible: boolean;
  criteria: Array<{
    name: string;
    description: string;
    passed: boolean;
    required: boolean;
  }>;
  blockers: string[];               // Motivos de inelegibilidade
  warnings: string[];               // Avisos (não bloqueiam, mas reduzem score)
}

// ============================================
// MATCHING RESULT
// ============================================

export interface MatchingResult {
  grantId: string;
  matchScore: number;               // 0-100
  eligible: boolean;
  eligibilityCheck?: EligibilityCheckResult;
  scoreBreakdown: {
    semanticSimilarity: number;     // 0-40 pontos
    sectorMatch: number;            // 0-20 pontos
    budgetAlignment: number;        // 0-15 pontos
    sizeEligibility: number;        // 0-10 pontos
    keywordOverlap: number;         // 0-15 pontos
  };
  blockers?: string[];
  warnings?: string[];
}
