import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * FAPESP Real Scraper
 * Scrapes REAL grant data from FAPESP's official website
 * Source: https://fapesp.br/oportunidades/
 */
export class FAPESPRealScraper implements GrantScraper {
  name = "FAPESP (Real Data)";
  private baseUrl = "https://fapesp.br";
  private oportunidadesUrl = `${this.baseUrl}/oportunidades/`;

  async scrape(): Promise<ScrapedGrant[]> {
    const grants: ScrapedGrant[] = [];

    try {
      console.log(`[${this.name}] Fetching real data from ${this.oportunidadesUrl}...`);

      const response = await axios.get(this.oportunidadesUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });

      const $ = cheerio.load(response.data);

      console.log(`[${this.name}] Page loaded, parsing opportunities...`);

      // Parse opportunities
      const selectors = [
        ".oportunidade",
        ".opportunity",
        ".chamada",
        "article",
        ".item-list",
        ".lista-oportunidades li",
      ];

      let foundItems = 0;
      for (const selector of selectors) {
        const items = $(selector);
        if (items.length > 0) {
          console.log(`[${this.name}] Found ${items.length} items with selector: ${selector}`);
          foundItems = items.length;

          items.each((_, element) => {
            try {
              const grant = this.parseGrantElement($, $(element));
              if (grant) {
                grants.push(grant);
              }
            } catch (error: any) {
              console.error(`[${this.name}] Error parsing opportunity:`, error.message);
            }
          });
          break;
        }
      }

      // Fallback: parse links
      if (foundItems === 0) {
        console.log(`[${this.name}] No structured items found, parsing links...`);
        $("a").each((_, element) => {
          const $link = $(element);
          const href = $link.attr("href") || "";
          const text = $link.text().trim();

          if (
            (href.includes("/oportunidade") || href.includes("/chamada") || href.includes("/pipe") || href.includes("/pite")) &&
            text.length > 20 &&
            !grants.some(g => g.title === text)
          ) {
            try {
              const grant = this.parseFromLink($, $link);
              if (grant) {
                grants.push(grant);
              }
            } catch (error: any) {
              console.error(`[${this.name}] Error parsing link:`, error.message);
            }
          }
        });
      }

      console.log(`[${this.name}] Successfully parsed ${grants.length} grants`);
    } catch (error: any) {
      console.error(`[${this.name}] Scraping error:`, error.message);
      if (error.response) {
        console.error(`[${this.name}] Response status: ${error.response.status}`);
      }
    }

    return grants;
  }

  private parseGrantElement($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): ScrapedGrant | null {
    const titleSelectors = ["h2", "h3", "h4", ".titulo", ".title", "a"];
    let title = "";
    for (const sel of titleSelectors) {
      title = $el.find(sel).first().text().trim();
      if (title && title.length > 15) break;
    }

    if (!title || title.length < 15) {
      return null;
    }

    const descSelectors = [".descricao", ".description", ".resumo", "p"];
    let description = "";
    for (const sel of descSelectors) {
      description = $el.find(sel).first().text().trim();
      if (description && description.length > 20) break;
    }
    if (!description) {
      description = title;
    }

    const linkEl = $el.find("a").first();
    let url = linkEl.attr("href") || "";
    if (url && !url.startsWith("http")) {
      url = `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    const deadline = this.extractDeadline($el.text());
    const { valueMin, valueMax } = this.extractValue(title, description);
    const externalId = url ? this.generateIdFromUrl(url) : `fapesp-${title.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    return {
      title,
      description,
      agency: "FAPESP",
      category: this.categorizeGrant(title, description),
      valueMin,
      valueMax,
      deadline,
      status: this.determineStatus(deadline),
      eligibilityCriteria: this.extractEligibility(title, description),
      keywords: this.extractKeywords(title, description),
      applicationUrl: url || this.oportunidadesUrl, // URL for applying
      sourceUrl: url || this.oportunidadesUrl, // Original source URL
      externalId,
    };
  }

  private parseFromLink($: cheerio.CheerioAPI, $link: cheerio.Cheerio<any>): ScrapedGrant | null {
    const title = $link.text().trim();
    const href = $link.attr("href") || "";
    const url = href.startsWith("http") ? href : `${this.baseUrl}${href}`;

    if (title.length < 20) {
      return null;
    }

    return {
      title,
      description: title,
      agency: "FAPESP",
      category: this.categorizeGrant(title, ""),
      valueMin: null,
      valueMax: null,
      deadline: null,
      status: "OPEN",
      eligibilityCriteria: {},
      keywords: this.extractKeywords(title, ""),
      applicationUrl: url, // URL for applying
      sourceUrl: url, // Original source URL
      externalId: this.generateIdFromUrl(url),
    };
  }

  private extractDeadline(text: string): Date | null {
    const ddmmyyyyMatch = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return new Date(`${year}-${month}-${day}`);
    }
    return null;
  }

  private extractValue(title: string, description: string): { valueMin: number | null; valueMax: number | null } {
    const text = `${title} ${description}`;
    let valueMax: number | null = null;

    // PIPE típico: até R$ 1 milhão por fase
    if (/pipe/i.test(text)) {
      if (/fase\s*1/i.test(text)) {
        valueMax = 250000; // PIPE Fase 1: até R$ 250k
      } else if (/fase\s*2/i.test(text)) {
        valueMax = 1000000; // PIPE Fase 2: até R$ 1M
      } else if (/fase\s*3/i.test(text)) {
        valueMax = 5000000; // PIPE Fase 3: até R$ 5M
      } else {
        valueMax = 1000000; // PIPE genérico
      }
    }

    // PITE: valores maiores
    if (/pite/i.test(text)) {
      valueMax = 5000000; // PITE: até R$ 5M
    }

    // Bolsas
    if (/bolsa/i.test(text)) {
      if (/pós-doutorado|posdoc/i.test(text)) {
        valueMax = 180000; // ~R$ 7.5k x 24 meses
      } else if (/doutorado/i.test(text)) {
        valueMax = 100000; // ~R$ 2.5k x 48 meses
      } else if (/mestrado/i.test(text)) {
        valueMax = 50000; // ~R$ 1.5k x 24 meses
      }
    }

    return { valueMin: null, valueMax };
  }

  private extractEligibility(title: string, description: string): any {
    const text = `${title} ${description}`.toLowerCase();
    const criteria: any = {};

    if (/pequena.*empresa|pme|micro.*empresa/i.test(text)) {
      criteria.companySize = ["MICRO", "SMALL"];
    }

    return criteria;
  }

  private categorizeGrant(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (/\b(ti|tecnologia|software|digital|ia|dados)\b/.test(text)) return "Tecnologia da Informação";
    if (/\b(bio|saúde|farmacê|medicin)\b/.test(text)) return "Biotecnologia";
    if (/\b(energia|renovável|solar)\b/.test(text)) return "Energia";
    if (/\b(agro|rural|agrícola)\b/.test(text)) return "Agronegócio";

    return "Pesquisa e Inovação";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns: { [key: string]: RegExp } = {
      "pesquisa": /pesquisa/,
      "inovação": /inovação/,
      "pipe": /pipe/,
      "pite": /pite/,
      "bolsa": /bolsa/,
      "startup": /startup|pequena empresa/,
      "parceria": /parceria/,
    };

    for (const [keyword, pattern] of Object.entries(keywordPatterns)) {
      if (pattern.test(text)) {
        keywords.push(keyword);
      }
    }

    return keywords.length > 0 ? keywords : ["pesquisa"];
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
    const cleaned = url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .substring(0, 100);
    return `fapesp-${cleaned}`;
  }
}
