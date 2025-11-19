import { prisma } from "@grantbr/database";
import { generateEmbedding, extractKeywords } from "../lib/openai";

/**
 * EMBRAPII Scraper
 * Mock data for EMBRAPII programs
 */
export async function scrapeEMBRAPII(): Promise<number> {
  console.log("🔍 Starting EMBRAPII scraper...");

  const mockGrants = [
    {
      title: "Projeto em Unidade EMBRAPII",
      description: "Financiamento compartilhado para projetos de P&D realizados em parceria com unidades EMBRAPII credenciadas. Empresa contribui com no mínimo 1/3 do valor total do projeto.",
      url: "https://embrapii.org.br/servicos/",
      valueMin: 200000,
      valueMax: 3000000,
      category: "P&D",
    },
    {
      title: "Programa de Inovação para Inserção Internacional",
      description: "Apoio a projetos de P&D voltados para o desenvolvimento de produtos, processos ou serviços com potencial de inserção no mercado internacional.",
      url: "https://embrapii.org.br/programa-insercao-internacional/",
      valueMin: 500000,
      valueMax: 5000000,
      category: "Internacionalização",
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
          externalId: `embrapii-${grantData.title.toLowerCase().replace(/\s+/g, "-")}`,
        },
        create: {
          externalId: `embrapii-${grantData.title.toLowerCase().replace(/\s+/g, "-")}`,
          title: grantData.title,
          agency: "EMBRAPII",
          category: grantData.category,
          description: grantData.description,
          url: grantData.url,
          valueMin: grantData.valueMin,
          valueMax: grantData.valueMax,
          currency: "BRL",
          status: "OPEN",
          deadline: new Date("2026-12-31"),
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
      console.error(`Error processing EMBRAPII grant "${grantData.title}":`, error);
    }
  }

  console.log(`✅ EMBRAPII scraper completed: ${savedCount} grants saved`);

  return savedCount;
}
