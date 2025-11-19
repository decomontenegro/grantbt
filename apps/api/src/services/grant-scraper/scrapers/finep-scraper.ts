import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * FINEP Grant Scraper
 * Scrapes grant opportunities from FINEP (Financiadora de Estudos e Projetos)
 */
export class FinepScraper implements GrantScraper {
  name = "FINEP";
  private baseUrl = "https://www.finep.gov.br";

  async scrape(): Promise<ScrapedGrant[]> {
    const grants: ScrapedGrant[] = [];

    try {
      console.log(`[${this.name}] Starting scrape...`);

      // FINEP's chamadas públicas (public calls) page
      const response = await axios.get(`${this.baseUrl}/chamadas-publicas`, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GrantBR/1.0; +https://grantbr.com.br)",
        },
      });

      const $ = cheerio.load(response.data);

      // Parse the grant listings
      $(".chamada-item, .card-chamada, .item-chamada").each((_, element) => {
        try {
          const $el = $(element);

          const title = $el.find("h2, h3, .titulo, .title").first().text().trim();
          const description = $el.find(".descricao, .description, p").first().text().trim();
          const detailsUrl = $el.find("a").first().attr("href") || "";
          const sourceUrl = detailsUrl.startsWith("http")
            ? detailsUrl
            : `${this.baseUrl}${detailsUrl}`;

          // Extract deadline if available
          let deadline: Date | null = null;
          const deadlineText = $el.find(".prazo, .deadline, .data-limite").text();
          const deadlineMatch = deadlineText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (deadlineMatch) {
            deadline = new Date(`${deadlineMatch[3]}-${deadlineMatch[2]}-${deadlineMatch[1]}`);
          }

          // Extract value range
          let valueMin: number | null = null;
          let valueMax: number | null = null;
          const valueText = $el.find(".valor, .value, .recursos").text();
          const valueMatch = valueText.match(/R\$\s*([\d.,]+)\s*(mil|milhão|milhões|M)/i);
          if (valueMatch) {
            let value = parseFloat(valueMatch[1].replace(/\./g, "").replace(",", "."));
            const unit = valueMatch[2].toLowerCase();
            if (unit.includes("mil")) value *= 1000;
            if (unit.includes("milh") || unit === "m") value *= 1000000;
            valueMax = value;
          }

          if (title && title.length > 10) {
            grants.push({
              title,
              description: description || title,
              agency: "FINEP",
              category: this.extractCategory(title, description),
              valueMin,
              valueMax,
              deadline,
              status: this.determineStatus(deadline),
              eligibilityCriteria: {},
              keywords: this.extractKeywords(title, description),
              applicationUrl: sourceUrl,
              sourceUrl,
              externalId: `finep-${this.generateIdFromUrl(sourceUrl)}`,
            });
          }
        } catch (error) {
          console.error(`[${this.name}] Error parsing grant item:`, error);
        }
      });

      console.log(`[${this.name}] Found ${grants.length} grants`);
    } catch (error: any) {
      console.error(`[${this.name}] Scraping error:`, error.message);
    }

    return grants;
  }

  private extractCategory(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (text.match(/inova(ç|c)ão|tecnologia|ti|digital|software|ia|inteligência artificial/)) {
      return "Tecnologia da Informação";
    }
    if (text.match(/bio|saúde|farmacê|medicin/)) {
      return "Biotecnologia";
    }
    if (text.match(/energia|renovável|solar|eólica|sustent/)) {
      return "Energia";
    }
    if (text.match(/agro|rural|agrícola/)) {
      return "Agronegócio";
    }
    if (text.match(/manufatura|indústria|fabrica/)) {
      return "Manufatura";
    }
    if (text.match(/educação|ensino|capacita/)) {
      return "Educação";
    }

    return "Inovação";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordMap = {
      "inovação": /inova(ç|c)ão/,
      "tecnologia": /tecnologia/,
      "sustentabilidade": /sustent/,
      "pesquisa": /pesquisa|p&d/,
      "desenvolvimento": /desenvolvimento/,
      "startup": /startup/,
      "pme": /pme|pequena.*média.*empresa/,
      "digital": /digital|digitaliza/,
      "ia": /inteligência artificial|ia/,
    };

    for (const [keyword, pattern] of Object.entries(keywordMap)) {
      if (pattern.test(text)) {
        keywords.push(keyword);
      }
    }

    return keywords;
  }

  private determineStatus(deadline: Date | null): "OPEN" | "CLOSED" | "UPCOMING" {
    if (!deadline) return "OPEN";

    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDeadline < 0) return "CLOSED";
    if (daysUntilDeadline > 30) return "UPCOMING";
    return "OPEN";
  }

  private generateIdFromUrl(url: string): string {
    return url.replace(/[^a-z0-9]/gi, "-").toLowerCase().substring(0, 50);
  }
}
