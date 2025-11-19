import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * FINEP Real Scraper
 * Scrapes REAL grant data from FINEP's official website
 * Source: https://www.finep.gov.br/chamadas-publicas
 */
export class FinepRealScraper implements GrantScraper {
  name = "FINEP (Real Data)";
  private baseUrl = "https://www.finep.gov.br";
  private chamadasUrl = `${this.baseUrl}/chamadas-publicas`;

  async scrape(): Promise<ScrapedGrant[]> {
    const grants: ScrapedGrant[] = [];

    try {
      console.log(`[${this.name}] Fetching real data from ${this.chamadasUrl}...`);

      const response = await axios.get(this.chamadasUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      const $ = cheerio.load(response.data);

      console.log(`[${this.name}] Page loaded, parsing grant listings...`);

      // FINEP uses multiple possible selectors for grant cards
      const selectors = [
        ".chamada-item",
        ".card-chamada",
        ".item-chamada",
        ".chamada",
        "article.chamada",
        ".list-item",
        ".edital-item",
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

      // If no structured items found, try to parse any links to "chamadas" or "editais"
      if (foundItems === 0) {
        console.log(`[${this.name}] No structured items found, trying link-based parsing...`);
        $("a").each((_, element) => {
          const $link = $(element);
          const href = $link.attr("href") || "";
          const text = $link.text().trim();

          if (
            (href.includes("/chamada") || href.includes("/edital")) &&
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
    // Extract title - try multiple selectors
    const titleSelectors = ["h2", "h3", "h4", ".titulo", ".title", ".chamada-titulo", "a"];
    let title = "";
    for (const sel of titleSelectors) {
      title = $el.find(sel).first().text().trim();
      if (title && title.length > 10) break;
    }

    if (!title || title.length < 10) {
      return null;
    }

    // Extract description
    const descSelectors = [".descricao", ".description", ".resumo", ".chamada-descricao", "p"];
    let description = "";
    for (const sel of descSelectors) {
      description = $el.find(sel).first().text().trim();
      if (description && description.length > 20) break;
    }
    if (!description) {
      description = title;
    }

    // Extract URL
    const linkEl = $el.find("a").first();
    let url = linkEl.attr("href") || "";
    if (url && !url.startsWith("http")) {
      url = `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    // Extract deadline
    let deadline: Date | null = null;
    const deadlineSelectors = [".prazo", ".deadline", ".data-limite", ".data", ".date"];
    for (const sel of deadlineSelectors) {
      const deadlineText = $el.find(sel).text();
      deadline = this.parseDate(deadlineText);
      if (deadline) break;
    }

    // Extract value
    const { valueMin, valueMax } = this.extractValue($el.text());

    // Generate external ID from URL or title
    const externalId = url ? this.generateIdFromUrl(url) : `finep-${title.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    return {
      title,
      description,
      agency: "FINEP",
      category: this.categorizeGrant(title, description),
      valueMin,
      valueMax,
      deadline,
      status: this.determineStatus(deadline),
      eligibilityCriteria: {},
      keywords: this.extractKeywords(title, description),
      applicationUrl: url || this.chamadasUrl, // URL for applying
      sourceUrl: url || this.chamadasUrl, // Original source URL
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
      agency: "FINEP",
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

  private parseDate(text: string): Date | null {
    // Try DD/MM/YYYY
    const ddmmyyyyMatch = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return new Date(`${year}-${month}-${day}`);
    }

    // Try YYYY-MM-DD
    const yyyymmddMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (yyyymmddMatch) {
      return new Date(yyyymmddMatch[0]);
    }

    return null;
  }

  private extractValue(text: string): { valueMin: number | null; valueMax: number | null } {
    let valueMin: number | null = null;
    let valueMax: number | null = null;

    // Match patterns like "R$ 1.000.000", "R$ 1 milhão", "até R$ 5M"
    const patterns = [
      /R\$\s*([\d.,]+)\s*(mil|milhão|milhões|bilhão|bilhões|M|B)?/gi,
      /até\s*R\$\s*([\d.,]+)\s*(mil|milhão|milhões|M)?/gi,
      /([\d.,]+)\s*(mil|milhão|milhões|M)\s*reais/gi,
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

    return { valueMin, valueMax };
  }

  private categorizeGrant(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    const categories: { [key: string]: RegExp[] } = {
      "Tecnologia da Informação": [/\b(ti|tecnologia|software|digital|ia|inteligência artificial|dados|blockchain|cloud)\b/],
      "Biotecnologia": [/\b(bio|saúde|farmacê|medicin|diagnóstico)\b/],
      "Energia": [/\b(energia|renovável|solar|eólica|sustent|hidro|biocombust)\b/],
      "Agronegócio": [/\b(agro|rural|agrícola|pecuária|agricultura)\b/],
      "Manufatura": [/\b(manufatura|indústria|fabricação|produção)\b/],
      "Educação": [/\b(educação|ensino|capacitação|treinamento)\b/],
      "Inovação": [/\b(inovação|p&d|pesquisa|desenvolvimento)\b/],
    };

    for (const [category, patterns] of Object.entries(categories)) {
      if (patterns.some(p => p.test(text))) {
        return category;
      }
    }

    return "Inovação";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns: { [key: string]: RegExp } = {
      "inovação": /inovação|inovador/,
      "tecnologia": /tecnologia|tecnológico/,
      "sustentabilidade": /sustent|ambiental/,
      "pesquisa": /pesquisa|p&d/,
      "desenvolvimento": /desenvolvimento/,
      "startup": /startup|empreendedor/,
      "pme": /pme|pequena.*média|micro.*empresa/,
      "digital": /digital|digitalização/,
      "ia": /inteligência artificial|ia\b|ai\b/,
      "energia": /energia|energético/,
      "saúde": /saúde|médico|clínico/,
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
    return `finep-${cleaned}`;
  }
}
