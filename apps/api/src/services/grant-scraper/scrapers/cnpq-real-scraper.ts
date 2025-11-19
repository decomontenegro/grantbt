import axios from "axios";
import * as cheerio from "cheerio";
import { GrantScraper, ScrapedGrant } from "../types";

/**
 * CNPq Real Scraper
 * Scrapes REAL grant data from CNPq's official website
 * Source: http://memoria2.cnpq.br/web/guest/chamadas-publicas
 */
export class CNPqRealScraper implements GrantScraper {
  name = "CNPq (Real Data)";
  private baseUrl = "http://memoria2.cnpq.br";
  private chamadasUrl = `${this.baseUrl}/web/guest/chamadas-publicas`;

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

      // Parse chamadas/editais
      const selectors = [
        "ol.list-chamadas > li[tabindex='0']", // Primary selector
        "ol.list-chamadas > li",                // Fallback without tabindex
        ".list-chamadas li",                     // Additional fallback
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
            (href.includes("/chamada") || href.includes("/edital") || text.toLowerCase().includes("chamada")) &&
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
    // CNPq structure: <li> contains .content with h4 (title) and p (description)
    const $content = $el.find(".content");

    // Title from h4
    const title = $content.find("h4").first().text().trim();

    if (!title || title.length < 15) {
      return null;
    }

    // Description from first p after h4
    let description = $content.find("p").first().text().trim();
    if (!description || description.length < 20) {
      description = title;
    }

    // Document link from .links-normas a.btn
    const linkEl = $el.find(".links-normas a.btn, .bottom-content a").first();
    let url = linkEl.attr("href") || "";
    // CNPq links are usually absolute URLs
    if (url && !url.startsWith("http")) {
      url = `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    // Extract deadline from .inscricao .datas li
    const deadlineText = $el.find(".inscricao .datas li").first().text().trim();
    const deadline = this.extractDeadline(deadlineText);

    const { valueMin, valueMax } = this.extractValue($el.text());
    const externalId = url ? this.generateIdFromUrl(url) : `cnpq-${title.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

    return {
      title,
      description,
      agency: "CNPq",
      category: this.categorizeGrant(title, description),
      valueMin,
      valueMax,
      deadline,
      status: this.determineStatus(deadline),
      eligibilityCriteria: {},
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
      agency: "CNPq",
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
    // CNPq uses date ranges: "DD/MM/YYYY a DD/MM/YYYY"
    // We want the end date (deadline)
    const dateRangeMatch = text.match(/\d{2}\/\d{2}\/\d{4}\s+a\s+(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateRangeMatch) {
      const [, day, month, year] = dateRangeMatch;
      return new Date(`${year}-${month}-${day}`);
    }

    // Fallback: single date
    const ddmmyyyyMatch = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return new Date(`${year}-${month}-${day}`);
    }
    return null;
  }

  private extractValue(text: string): { valueMin: number | null; valueMax: number | null } {
    let valueMax: number | null = null;

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

    return { valueMin: null, valueMax };
  }

  private categorizeGrant(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    if (/\b(ti|tecnologia|software|digital|ia|dados)\b/.test(text)) return "Tecnologia da Informação";
    if (/\b(bio|saúde|farmacê|medicin)\b/.test(text)) return "Biotecnologia";
    if (/\b(energia|renovável|solar)\b/.test(text)) return "Energia";
    if (/\b(agro|rural|agrícola)\b/.test(text)) return "Agronegócio";
    if (/\b(educação|ensino)\b/.test(text)) return "Educação";

    return "Pesquisa e Desenvolvimento";
  }

  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    const keywordPatterns: { [key: string]: RegExp } = {
      "pesquisa": /pesquisa/,
      "bolsa": /bolsa/,
      "pós-graduação": /pós-graduação|mestrado|doutorado/,
      "inovação": /inovação/,
      "desenvolvimento": /desenvolvimento/,
      "ciência": /ciência|científico/,
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
    return `cnpq-${cleaned}`;
  }
}
