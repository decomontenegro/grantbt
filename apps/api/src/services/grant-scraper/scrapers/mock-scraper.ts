import { GrantScraper, ScrapedGrant } from "../types";

/**
 * Mock Grant Scraper
 * Generates realistic mock grant data for testing and development
 * Also serves as fallback when real scrapers fail
 */
export class MockScraper implements GrantScraper {
  name = "Mock Generator";

  async scrape(): Promise<ScrapedGrant[]> {
    console.log(`[${this.name}] Generating mock grants...`);

    const grants: ScrapedGrant[] = [
      {
        title: "FINEP Subvenção Econômica - Inovação para Transformação Digital",
        description: "Apoio financeiro não reembolsável para empresas que desenvolvam soluções inovadoras em transformação digital, inteligência artificial e tecnologias emergentes. Foco em projetos com alto potencial de impacto econômico e social.",
        agency: "FINEP",
        category: "Tecnologia da Informação",
        valueMin: 500000,
        valueMax: 3000000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MICRO", "SMALL", "MEDIUM"],
          sectors: ["Tecnologia da Informação", "Inovação"],
        },
        keywords: ["inovação", "tecnologia", "digital", "ia", "transformação digital"],
        applicationUrl: "https://www.finep.gov.br/chamadas-publicas/exemplo-1",
        sourceUrl: "https://www.finep.gov.br/chamadas-publicas/exemplo-1",
        externalId: "mock-finep-001",
      },
      {
        title: "FAPESP PIPE - Pesquisa Inovativa em Pequenas Empresas - Fase 2",
        description: "Financiamento para desenvolvimento de pesquisa científica e/ou tecnológica em pequenas empresas. Projetos devem demonstrar viabilidade técnica e comercial, com foco em inovação de produto ou processo.",
        agency: "FAPESP",
        category: "Inovação",
        valueMin: 300000,
        valueMax: 1000000,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MICRO", "SMALL"],
          sectors: ["Todos"],
        },
        keywords: ["pesquisa", "inovação", "p&d", "desenvolvimento"],
        applicationUrl: "https://fapesp.br/pipe/exemplo-1",
        sourceUrl: "https://fapesp.br/pipe/exemplo-1",
        externalId: "mock-fapesp-001",
      },
      {
        title: "EMBRAPII - Projetos de Pesquisa e Desenvolvimento em Saúde Digital",
        description: "Apoio a projetos de P&D em parceria com unidades EMBRAPII, focados em soluções de saúde digital, telemedicina, dispositivos médicos inteligentes e sistemas de diagnóstico baseados em IA.",
        agency: "EMBRAPII",
        category: "Biotecnologia",
        valueMin: 500000,
        valueMax: 2000000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MICRO", "SMALL", "MEDIUM", "LARGE"],
          sectors: ["Saúde", "Tecnologia da Informação"],
        },
        keywords: ["saúde", "digital", "ia", "telemedicina", "pesquisa"],
        applicationUrl: "https://embrapii.org.br/chamadas/exemplo-1",
        sourceUrl: "https://embrapii.org.br/chamadas/exemplo-1",
        externalId: "mock-embrapii-001",
      },
      {
        title: "SEBRAE - ALI Digital: Agentes Locais de Inovação Digital",
        description: "Programa de consultoria gratuita para empresas implementarem inovações digitais. Inclui diagnóstico, planejamento e acompanhamento de implementação de soluções tecnológicas.",
        agency: "SEBRAE",
        category: "Tecnologia da Informação",
        valueMin: null,
        valueMax: 50000,
        deadline: null, // Contínuo
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MEI", "MICRO", "SMALL"],
        },
        keywords: ["digital", "consultoria", "inovação", "tecnologia"],
        applicationUrl: "https://sebrae.com.br/ali-digital",
        sourceUrl: "https://sebrae.com.br/ali-digital",
        externalId: "mock-sebrae-001",
      },
      {
        title: "BNDES Fundo Clima - Energias Renováveis e Eficiência Energética",
        description: "Financiamento para projetos de energia renovável (solar, eólica, biomassa), eficiência energética e tecnologias limpas. Taxas de juros subsidiadas e prazos alongados.",
        agency: "BNDES",
        category: "Energia",
        valueMin: 1000000,
        valueMax: 10000000,
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["SMALL", "MEDIUM", "LARGE"],
          sectors: ["Energia"],
        },
        keywords: ["energia", "renovável", "sustentabilidade", "solar", "eólica"],
        applicationUrl: "https://www.bndes.gov.br/fundo-clima",
        sourceUrl: "https://www.bndes.gov.br/fundo-clima",
        externalId: "mock-bndes-001",
      },
      {
        title: "CNPq - Bolsas de Inovação Tecnológica na Empresa",
        description: "Concessão de bolsas para profissionais desenvolverem projetos de inovação tecnológica em empresas. Fomenta a integração entre academia e setor produtivo.",
        agency: "CNPq",
        category: "Inovação",
        valueMin: 100000,
        valueMax: 500000,
        deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MICRO", "SMALL", "MEDIUM", "LARGE"],
        },
        keywords: ["inovação", "pesquisa", "tecnologia", "bolsas"],
        applicationUrl: "https://www.gov.br/cnpq/pt-br/inovacao",
        sourceUrl: "https://www.gov.br/cnpq/pt-br/inovacao",
        externalId: "mock-cnpq-001",
      },
      {
        title: "FINEP Inovacred - Crédito para Inovação com Taxas Competitivas",
        description: "Linha de crédito com condições favoráveis para empresas investirem em projetos de inovação. Taxas de juros reduzidas, prazos alongados e carência para pagamento.",
        agency: "FINEP",
        category: "Inovação",
        valueMin: 1000000,
        valueMax: 50000000,
        deadline: null, // Contínuo
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["SMALL", "MEDIUM", "LARGE"],
        },
        keywords: ["crédito", "inovação", "financiamento"],
        applicationUrl: "https://www.finep.gov.br/inovacred",
        sourceUrl: "https://www.finep.gov.br/inovacred",
        externalId: "mock-finep-002",
      },
      {
        title: "FAPESP Pesquisa em Parceria para Inovação Tecnológica - PITE",
        description: "Apoio a projetos de pesquisa desenvolvidos em parceria entre instituições de pesquisa e empresas, visando inovação tecnológica com aplicação prática no setor produtivo.",
        agency: "FAPESP",
        category: "Inovação",
        valueMin: 500000,
        valueMax: 5000000,
        deadline: new Date(Date.now() + 105 * 24 * 60 * 60 * 1000), // 105 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["SMALL", "MEDIUM", "LARGE"],
        },
        keywords: ["pesquisa", "parceria", "inovação", "tecnologia"],
        applicationUrl: "https://fapesp.br/pite",
        sourceUrl: "https://fapesp.br/pite",
        externalId: "mock-fapesp-002",
      },
      {
        title: "EMBRAPII - Manufatura Avançada e Indústria 4.0",
        description: "Desenvolvimento de projetos em manufatura avançada, automação, robótica, IoT industrial e sistemas ciberfísicos. Parceria com unidades EMBRAPII especializadas.",
        agency: "EMBRAPII",
        category: "Manufatura",
        valueMin: 750000,
        valueMax: 3000000,
        deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000), // 80 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MEDIUM", "LARGE"],
          sectors: ["Manufatura", "Tecnologia da Informação"],
        },
        keywords: ["manufatura", "indústria 4.0", "automação", "iot"],
        applicationUrl: "https://embrapii.org.br/manufatura-avancada",
        sourceUrl: "https://embrapii.org.br/manufatura-avancada",
        externalId: "mock-embrapii-002",
      },
      {
        title: "BNDES MPME Inovadora - Apoio a Micro, Pequenas e Médias Empresas Inovadoras",
        description: "Financiamento específico para MPMEs com projetos inovadores. Inclui capital de giro associado a investimentos em inovação, tecnologia e capacitação.",
        agency: "BNDES",
        category: "Inovação",
        valueMin: 300000,
        valueMax: 5000000,
        deadline: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000), // 95 days
        status: "OPEN",
        eligibilityCriteria: {
          companySize: ["MEI", "MICRO", "SMALL", "MEDIUM"],
        },
        keywords: ["pme", "inovação", "financiamento", "startup"],
        applicationUrl: "https://www.bndes.gov.br/mpme-inovadora",
        sourceUrl: "https://www.bndes.gov.br/mpme-inovadora",
        externalId: "mock-bndes-002",
      },
    ];

    console.log(`[${this.name}] Generated ${grants.length} mock grants`);
    return grants;
  }
}
