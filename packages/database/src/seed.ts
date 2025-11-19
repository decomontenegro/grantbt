import { prisma } from "./index";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed some example grants (FINEP, FAPESP, EMBRAPII)
  const grants = await prisma.grant.createMany({
    data: [
      {
        title: "FINEP Inovação - Apoio a Projetos de P&D",
        agency: "FINEP",
        category: "Inovação",
        description:
          "Financiamento para projetos de pesquisa e desenvolvimento com foco em inovação tecnológica. Modalidade de subvenção econômica e financiamento reembolsável para empresas inovadoras.",
        url: "https://www.finep.gov.br",
        valueMin: 100000,
        valueMax: 5000000,
        currency: "BRL",
        status: "OPEN",
        deadline: new Date("2025-12-31"),
        keywords: ["inovação", "P&D", "tecnologia", "subvenção", "reembolsável"],
        embedding: [], // Would be populated by AI service
        eligibilityCriteria: {
          companySize: ["SMALL", "MEDIUM", "LARGE"],
          minRevenue: 100000, // R$ 100 mil mínimo
          minYearsOperation: 2, // Pelo menos 2 anos de existência
          fundingType: "misto", // Pode ser subvenção ou reembolsável
          counterpartRequired: true,
          counterpartPercentage: 20, // Mínimo 20% de contrapartida
          prioritySectors: [
            "Tecnologia da Informação",
            "Biotecnologia",
            "Energia Renovável",
            "Manufatura Avançada",
            "Saúde Digital",
          ],
        },
      },
      {
        title: "FAPESP - Pesquisa Inovativa em Pequenas Empresas (PIPE)",
        agency: "FAPESP",
        category: "Pesquisa",
        description:
          "Apoio a projetos de pesquisa científica e/ou tecnológica em micro, pequenas e médias empresas. Programa exclusivo do estado de São Paulo com 3 fases de financiamento.",
        url: "https://fapesp.br/pipe",
        valueMin: 50000,
        valueMax: 1000000,
        currency: "BRL",
        status: "OPEN",
        deadline: new Date("2026-03-31"),
        keywords: ["PIPE", "pesquisa", "pequenas empresas", "São Paulo", "inovação"],
        embedding: [],
        eligibilityCriteria: {
          companySize: ["MICRO", "SMALL", "MEDIUM"], // Apenas PMEs
          states: ["SP"], // Exclusivo São Paulo
          minRevenue: 0, // Sem faturamento mínimo
          minYearsOperation: 0, // Aceita startups recentes
          fundingType: "não-reembolsável",
          counterpartRequired: false, // Não exige contrapartida
          maxEmployees: 250, // Máximo 250 funcionários
          priorityThemes: [
            "Pesquisa Científica",
            "Desenvolvimento Tecnológico",
            "Prova de Conceito",
            "Inovação Radical",
          ],
        },
      },
      {
        title: "EMBRAPII - Unidades de Pesquisa",
        agency: "EMBRAPII",
        category: "P&D",
        description:
          "Financiamento compartilhado para projetos de P&D em parceria com unidades EMBRAPII credenciadas. Modelo de financiamento tripartite (empresa + EMBRAPII + unidade).",
        url: "https://embrapii.org.br",
        valueMin: 200000,
        valueMax: 3000000,
        currency: "BRL",
        status: "OPEN",
        keywords: ["EMBRAPII", "parceria", "unidades", "P&D colaborativo"],
        embedding: [],
        eligibilityCriteria: {
          companySize: ["SMALL", "MEDIUM", "LARGE"],
          minRevenue: 200000, // R$ 200 mil mínimo
          minYearsOperation: 1, // Pelo menos 1 ano
          fundingType: "não-reembolsável",
          counterpartRequired: true,
          counterpartPercentage: 33.3, // Empresa arca com 1/3 do projeto
          requiredPartners: ["EMBRAPII_UNIT"], // Obrigatório parceria com unidade
          prioritySectors: [
            "Indústria 4.0",
            "Manufatura Avançada",
            "TIC Aplicada",
            "Biotecnologia Industrial",
            "Energia",
          ],
        },
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${grants.count} sample grants`);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@grantbr.com" },
    update: {},
    create: {
      email: "admin@grantbr.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
