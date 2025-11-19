import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * BNDES Real Scraper
 * Scrapes REAL grant/financing data from BNDES's official website
 * Source: https://www.bndes.gov.br/wps/portal/site/home/financiamento
 */
export class BNDESRealScraper implements GrantScraper {
  name = "BNDES (Real Data)";
  private baseUrl = "https://www.bndes.gov.br";
  private financiamentoUrl = `${this.baseUrl}/wps/portal/site/home/financiamento`;

  async scrape(): Promise<ScrapedGrant[]> {
    const grants: ScrapedGrant[] = [];

    try {
      console.log(`[${this.name}] Fetching real data from ${this.financiamentoUrl}...`);

      const response = await axios.get(this.financiamentoUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });

      const $ = cheerio.load(response.data);

      console.log(`[${this.name}] Page loaded, parsing financing options...`);

      // Parse financing products
      const selectors = [
        ".produto",
        ".card",
        ".linha-financiamento",
        "article",
        ".item-financiamento",
        ".financing-item",
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
              console.error(`[${this.name}] Error parsing financing item:`, error.message);
            }
          });
          break;
        }
      }

      // Fallback: parse links to financing products
      if (foundItems === 0) {
        console.log(`[${this.name}] No structured items found, parsing links...`);
        $("a").each((_, element) => {
          const $link = $(element);
          const href = $link.attr("href") || "";
          const text = $link.text().trim();

          if (
            (href.includes("/financiamento") ||
             href.includes("/produto") ||
             text.toLowerCase().includes("finem") ||
             text.toLowerCase().includes("inovação") ||
             text.toLowerCase().includes("mpme")) &&
            text.length > 15 &&
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

      console.log(`[${this.name}] Successfully parsed ${grants.length} financing products`);
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
      if (title && title.length > 10) break;
    }

    if (!title || title.length < 10) {
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

    const { valueMin, valueMax } = this.extractValue(title, description);
    const externalId = url ? this.generateIdFromUrl(url) : `bndes-${title.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    return {
      title,
      description,
      agency: "BNDES",
      category: this.categorizeGrant(title, description),
      valueMin,
      valueMax,
      deadline: null, // BNDES geralmente não tem deadline fixo
      status: "OPEN",
      eligibilityCriteria: this.extractEligibility(title, description),
      keywords: this.extractKeywords(title, description),
      applicationUrl: url || this.financiamentoUrl,
      sourceUrl: url || this.financiamentoUrl,
      externalId,
    };
  }

  private parseFromLink($: cheerio.CheerioAPI, $link: cheerio.Cheerio<any>): ScrapedGrant | null {
    const title = $link.text().trim();
    const href = $link.attr("href") || "";
    const url = href.startsWith("http") ? href : `${this.baseUrl}${href}`;

    if (title.length < 15) {
      return null;
    }

    return {
      title,
      description: title,
      agency: "BNDES",
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

  private extractValue(title: string, description: string): { valueMin: number | null; valueMax: number | null } {
    const text = `${title} ${description}`;
    let valueMin: number | null = null;
    let valueMax: number | null = null;

    // BNDES typical values
    const patterns = [
      /R\$\s*([\d.,]+)\s*(mil|milhão|milhões|bilhão|bilhões|M|B)?/gi,
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
        } else if (unit.includes("bilh") || unit === "b") {
          value *= 1000000000;
        }

        if (match[0].toLowerCase().includes("até")) {
          valueMax = value;
        } else if (!valueMax || value > valueMax) {
          valueMax = value;
        }
      }
    }

    // Default BNDES MPME: R$ 10M
    if (!valueMax && /mpme|micro|pequena|média/i.test(text)) {
      valueMax = 10000000;
    }

    // Default BNDES FINEM: R$ 50M
    if (!valueMax && /finem/i.test(text)) {
      valueMin = 10000000; // Mínimo R$ 10M
      valueMax = 500000000; // Até R$ 500M
    }

    return { valueMin, valueMax };
  }

  private extractEligibility(title: string, description: string): any {
    const text = `${title} ${description}`.toLowerCase();
    const criteria: any = {};

    if (/mpme|micro|pequena|média/i.test(text)) {
      criteria.companySize = ["MICRO", "SMALL", "MEDIUM"];
    } else if (/finem|grande/i.test(text)) {
      criteria.companySize = ["MEDIUM", "LARGE"];
    }

    return criteria;
  }

  private categorizeGrant(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (/\b(inovação|p&d|pesquisa|desenvolvimento)\b/.test(text)) return "Inovação";
    if (/\b(energia|renovável|solar|eólica|sustent)\b/.test(text)) return "Energia";
    if (/\b(infraestrutura|logística|transporte)\b/.test(text)) return "Infraestrutura";
    if (/\b(agro|rural|agrícola)\b/.test(text)) return "Agronegócio";
    if (/\b(exportação|internacionalização)\b/.test(text)) return "Comércio Exterior";
    if (/\b(mpme|micro|pequena|média)\b/.test(text)) return "Pequenas e Médias Empresas";

    return "Financiamento";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns: { [key: string]: RegExp } = {
      "financiamento": /financiamento/,
      "crédito": /crédito/,
      "finem": /finem/,
      "mpme": /mpme/,
      "inovação": /inovação/,
      "investimento": /investimento/,
      "longo prazo": /longo prazo/,
      "taxa subsidiada": /taxa.*subsidiada|juros.*reduzidos/,
    };

    for (const [keyword, pattern] of Object.entries(keywordPatterns)) {
      if (pattern.test(text)) {
        keywords.push(keyword);
      }
    }

    return keywords.length > 0 ? keywords : ["financiamento"];
  }

  private generateIdFromUrl(url: string): string {
    const cleaned = url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .substring(0, 100);
    return `bndes-${cleaned}`;
  }
}
