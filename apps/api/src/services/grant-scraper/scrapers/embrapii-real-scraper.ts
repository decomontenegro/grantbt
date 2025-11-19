import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * EMBRAPII Real Scraper
 * Scrapes REAL grant data from EMBRAPII's official website
 * Source: https://embrapii.org.br/transparencia/
 */
export class EMBRAPIIRealScraper implements GrantScraper {
  name = "EMBRAPII (Real Data)";
  private baseUrl = "https://embrapii.org.br";
  private chamadasUrl = `${this.baseUrl}/transparencia/`;

  async scrape(): Promise<ScrapedGrant[]> {
    const grants: ScrapedGrant[] = [];

    try {
      console.log(`[${this.name}] Fetching real data from ${this.chamadasUrl}...`);

      const response = await axios.get(this.chamadasUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });

      const $ = cheerio.load(response.data);

      console.log(`[${this.name}] Page loaded, parsing grant listings...`);

      // Parse chamadas/editais from transparencia page
      const selectors = [
        ".chamada-item",           // Primary selector
        ".transparencia-item",     // Alternative
        "h3 a[href*='chamadas-publicas']", // Fallback to direct links
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
              console.error(`[${this.name}] Error parsing grant item:`, error.message);
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
            (href.includes("/chamadas-publicas/") ||
             text.toLowerCase().includes("chamada pública") ||
             text.toLowerCase().includes("chamada publica") ||
             text.toLowerCase().includes("edital")) &&
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

    const descSelectors = [".descricao", ".description", ".resumo", "p", ".excerpt"];
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
    const externalId = url ? this.generateIdFromUrl(url) : `embrapii-${title.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    return {
      title,
      description,
      agency: "EMBRAPII",
      category: this.categorizeGrant(title, description),
      valueMin,
      valueMax,
      deadline,
      status: this.determineStatus(deadline),
      eligibilityCriteria: this.extractEligibility(title, description),
      keywords: this.extractKeywords(title, description),
      applicationUrl: url || this.chamadasUrl,
      sourceUrl: url || this.chamadasUrl,
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
      agency: "EMBRAPII",
      category: this.categorizeGrant(title, ""),
      valueMin: null,
      valueMax: null,
      deadline: null,
      status: "OPEN",
      eligibilityCriteria: {},
      keywords: this.extractKeywords(title, ""),
      applicationUrl: url,
      sourceUrl: url,
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

    // EMBRAPII típico: até R$ 3 milhões por projeto
    const patterns = [
      /R\$\s*([\d.,]+)\s*(mil|milhão|milhões|M)?/gi,
      /até\s*R\$\s*([\d.,]+)\s*(mil|milhão|milhões|M)?/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        let value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        const unit = match[2]?.toLowerCase() || "";

        if (unit.includes("mil") && !unit.includes("milh")) {
          value *= 1000;
        } else if (unit.includes("milh") || unit === "m") {
          value *= 1000000;
        }

        if (!valueMax || value > valueMax) {
          valueMax = value;
        }
      }
    }

    // Default EMBRAPII: até R$ 3M por projeto
    if (!valueMax && /(projeto|p&d|pesquisa)/i.test(text)) {
      valueMax = 3000000;
    }

    return { valueMin: null, valueMax };
  }

  private extractEligibility(title: string, description: string): any {
    const text = `${title} ${description}`.toLowerCase();
    const criteria: any = {};

    if (/pme|pequena.*média|micro.*empresa/i.test(text)) {
      criteria.companySize = ["MICRO", "SMALL", "MEDIUM"];
    } else {
      criteria.companySize = ["MICRO", "SMALL", "MEDIUM", "LARGE"];
    }

    return criteria;
  }

  private categorizeGrant(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (/\b(ti|tecnologia|software|digital|ia|dados|iot)\b/.test(text)) return "Tecnologia da Informação";
    if (/\b(bio|saúde|farmacê|medicin)\b/.test(text)) return "Biotecnologia";
    if (/\b(energia|renovável|solar)\b/.test(text)) return "Energia";
    if (/\b(manufatura|indústria|produção)\b/.test(text)) return "Manufatura";
    if (/\b(agro|rural|agrícola)\b/.test(text)) return "Agronegócio";

    return "Inovação";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns: { [key: string]: RegExp } = {
      "inovação": /inovação/,
      "p&d": /p&d|pesquisa.*desenvolvimento/,
      "manufatura": /manufatura/,
      "indústria 4.0": /indústria 4\.0|industria 4\.0/,
      "tecnologia": /tecnologia/,
      "parceria": /parceria|cooperação/,
      "unidade embrapii": /unidade.*embrapii/,
    };

    for (const [keyword, pattern] of Object.entries(keywordPatterns)) {
      if (pattern.test(text)) {
        keywords.push(keyword);
      }
    }

    return keywords.length > 0 ? keywords : ["inovação"];
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
    return `embrapii-${cleaned}`;
  }
}
