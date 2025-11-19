import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * SEBRAE Real Scraper
 * Scrapes REAL programs and support data from SEBRAE's official website
 * Source: https://sebrae.com.br/sites/PortalSebrae/acredita (Credit programs)
 */
export class SEBRAERealScraper implements GrantScraper {
  name = "SEBRAE (Real Data)";
  private baseUrl = "https://sebrae.com.br";
  private programasUrl = `${this.baseUrl}/sites/PortalSebrae/acredita`;

  async scrape(): Promise<ScrapedGrant[]> {
    const grants: ScrapedGrant[] = [];

    try {
      console.log(`[${this.name}] Fetching real data from ${this.programasUrl}...`);

      const response = await axios.get(this.programasUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });

      const $ = cheerio.load(response.data);

      console.log(`[${this.name}] Page loaded, parsing programs...`);

      // Parse programs from Acredita page
      const selectors = [
        "[data-sb-categoria]",     // Content sections with category data
        ".card",
        "article",
        "section",
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
              console.error(`[${this.name}] Error parsing program item:`, error.message);
            }
          });
          break;
        }
      }

      // Fallback: parse links to programs
      if (foundItems === 0) {
        console.log(`[${this.name}] No structured items found, parsing links...`);
        $("a").each((_, element) => {
          const $link = $(element);
          const href = $link.attr("href") || "";
          const text = $link.text().trim();

          if (
            (href.includes("/programa") ||
             href.includes("/servico") ||
             href.includes("/acredita") ||
             href.includes("/credito") ||
             text.toLowerCase().includes("ali") ||
             text.toLowerCase().includes("sebraetec") ||
             text.toLowerCase().includes("acredita") ||
             text.toLowerCase().includes("consultoria")) &&
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

      console.log(`[${this.name}] Successfully parsed ${grants.length} programs`);
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
    const externalId = url ? this.generateIdFromUrl(url) : `sebrae-${title.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    return {
      title,
      description,
      agency: "SEBRAE",
      category: this.categorizeGrant(title, description),
      valueMin,
      valueMax,
      deadline: null, // SEBRAE geralmente tem programas contínuos
      status: "OPEN",
      eligibilityCriteria: this.extractEligibility(title, description),
      keywords: this.extractKeywords(title, description),
      applicationUrl: url || this.programasUrl,
      sourceUrl: url || this.programasUrl,
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
      agency: "SEBRAE",
      category: this.categorizeGrant(title, ""),
      valueMin: null,
      valueMax: null,
      deadline: null,
      status: "OPEN",
      eligibilityCriteria: { companySize: ["MEI", "MICRO", "SMALL"] },
      keywords: this.extractKeywords(title, ""),
      applicationUrl: url,
      sourceUrl: url,
      externalId: this.generateIdFromUrl(url),
    };
  }

  private extractValue(title: string, description: string): { valueMin: number | null; valueMax: number | null } {
    const text = `${title} ${description}`;
    let valueMax: number | null = null;

    // SEBRAE típico: valores menores, programas de consultoria
    const patterns = [
      /R\$\s*([\d.,]+)\s*(mil|milhão|milhões|M)?/gi,
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

    // Default SEBRAE ALI: até R$ 50k em consultoria
    if (!valueMax && /ali|consultoria|sebraetec/i.test(text)) {
      valueMax = 50000;
    }

    return { valueMin: null, valueMax };
  }

  private extractEligibility(title: string, description: string): any {
    const text = `${title} ${description}`.toLowerCase();
    const criteria: any = {};

    // SEBRAE é focado em MEI, Micro e Pequenas empresas
    if (/mei/i.test(text)) {
      criteria.companySize = ["MEI"];
    } else if (/microempreendedor/i.test(text)) {
      criteria.companySize = ["MEI", "MICRO"];
    } else {
      criteria.companySize = ["MEI", "MICRO", "SMALL"];
    }

    return criteria;
  }

  private categorizeGrant(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (/\b(digital|tecnologia|software|online|ia)\b/.test(text)) return "Tecnologia da Informação";
    if (/\b(inovação|startups?)\b/.test(text)) return "Inovação";
    if (/\b(gestão|administração|planejamento)\b/.test(text)) return "Gestão Empresarial";
    if (/\b(vendas|marketing|comercial)\b/.test(text)) return "Comercialização";
    if (/\b(exportação|internacionalização)\b/.test(text)) return "Comércio Exterior";
    if (/\b(capacitação|treinamento|formação)\b/.test(text)) return "Capacitação";

    return "Consultoria e Capacitação";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns: { [key: string]: RegExp } = {
      "consultoria": /consultoria/,
      "capacitação": /capacitação|treinamento/,
      "ali": /ali|agentes.*locais.*inovação/,
      "sebraetec": /sebraetec/,
      "mei": /mei|microempreendedor/,
      "pequena empresa": /pequena.*empresa|pequeno.*negócio/,
      "gestão": /gestão/,
      "digital": /digital|tecnologia/,
      "inovação": /inovação/,
      "gratuito": /gratuito|sem custo/,
    };

    for (const [keyword, pattern] of Object.entries(keywordPatterns)) {
      if (pattern.test(text)) {
        keywords.push(keyword);
      }
    }

    return keywords.length > 0 ? keywords : ["consultoria"];
  }

  private generateIdFromUrl(url: string): string {
    const cleaned = url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .substring(0, 100);
    return `sebrae-${cleaned}`;
  }
}
