import { prisma } from "@grantbr/database";
import { generateEmbedding, extractKeywords } from "../lib/openai";

/**
 * FAPESP Scraper
 * Currently using mock data - can be enhanced with actual scraping
 */
export async function scrapeFAPESP(): Promise<number> {
  console.log("🔍 Starting FAPESP scraper...");

  // Mock FAPESP programs (in production, scrape from https://fapesp.br/oportunidades)
  const mockGrants = [
    {
      title: "PIPE - Pesquisa Inovativa em Pequenas Empresas",
      description: "Apoio a projetos de pesquisa científica e/ou tecnológica a serem executados em pequenas empresas no Estado de São Paulo. Fase 1: até R$ 300 mil. Fase 2: até R$ 1 milhão.",
      url: "https://fapesp.br/pipe",
      valueMin: 50000,
      valueMax: 1000000,
      category: "Pesquisa",
    },
    {
      title: "PITE - Pesquisa em Parceria para Inovação Tecnológica",
      description: "Apoio a projetos de pesquisa realizados em instituições acadêmicas em parceria com empresas, visando a inovação tecnológica.",
      url: "https://fapesp.br/pite",
      valueMin: 200000,
      valueMax: 3000000,
      category: "P&D",
    },
    {
      title: "Auxílio à Pesquisa - Regular",
      description: "Apoio financeiro para desenvolvimento de pesquisa científica ou tecnológica por pesquisadores vinculados a instituições de ensino superior ou de pesquisa no Estado de São Paulo.",
      url: "https://fapesp.br/auxilios/regular",
      valueMin: 20000,
      valueMax: 500000,
      category: "Pesquisa",
    },
  ];

  let savedCount = 0;

  for (const grantData of mockGrants) {
    try {
      const fullText = `${grantData.title} ${grantData.description}`;
      const embedding = await generateEmbedding(fullText);
      const keywords = await extractKeywords(fullText);

      await prisma.grant.upsert({
        where: {
          externalId: `fapesp-${grantData.title.toLowerCase().replace(/\s+/g, "-")}`,
        },
        create: {
          externalId: `fapesp-${grantData.title.toLowerCase().replace(/\s+/g, "-")}`,
          title: grantData.title,
          agency: "FAPESP",
          category: grantData.category,
          description: grantData.description,
          url: grantData.url,
          valueMin: grantData.valueMin,
          valueMax: grantData.valueMax,
          currency: "BRL",
          status: "OPEN",
          deadline: new Date("2026-12-31"), // FAPESP programs are usually ongoing
          keywords,
          embedding,
          scrapedAt: new Date(),
        },
        update: {
          description: grantData.description,
          lastChecked: new Date(),
        },
      });

      savedCount++;
    } catch (error) {
      console.error(`Error processing FAPESP grant "${grantData.title}":`, error);
    }
  }

  console.log(`✅ FAPESP scraper completed: ${savedCount} grants saved`);

  return savedCount;
}
