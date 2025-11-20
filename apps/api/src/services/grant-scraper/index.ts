import { prisma } from "@grantbr/database";
import { generateGrantEmbedding } from "../../lib/openai";
import { GrantScraper, ScrapedGrant, ScrapeResult } from "./types";
import { FinepRealScraper } from "./scrapers/finep-real-scraper";
import { CNPqRealScraper } from "./scrapers/cnpq-real-scraper";
import { FAPESPRealScraper } from "./scrapers/fapesp-real-scraper";
import { EMBRAPIIRealScraper } from "./scrapers/embrapii-real-scraper";
import { BNDESRealScraper } from "./scrapers/bndes-real-scraper";
import { SEBRAERealScraper } from "./scrapers/sebrae-real-scraper";

/**
 * GRANT COLLECTION SERVICE
 * Main service for collecting, processing and storing grant opportunities
 */
export class GrantCollectionService {
  private scrapers: GrantScraper[] = [];

  constructor(private useMockData = false) {
    // Initialize scrapers - ALWAYS use real data sources
    console.log("[GrantCollectionService] Initializing REAL data scrapers");
    console.log("[GrantCollectionService] Sources: FINEP, CNPq, FAPESP, EMBRAPII, BNDES, SEBRAE");

    this.scrapers.push(
      new FinepRealScraper(),
      new CNPqRealScraper(),
      new FAPESPRealScraper(),
      new EMBRAPIIRealScraper(),
      new BNDESRealScraper(),
      new SEBRAERealScraper()
    );
  }

  /**
   * Run all scrapers and collect grants
   */
  async collectGrants(): Promise<ScrapeResult[]> {
    console.log("\n=== Starting Grant Collection ===\n");
    const results: ScrapeResult[] = [];

    for (const scraper of this.scrapers) {
      const result = await this.runScraper(scraper);
      results.push(result);
    }

    console.log("\n=== Grant Collection Complete ===");
    console.log(`Total sources scraped: ${results.length}`);
    console.log(`Total grants found: ${results.reduce((sum, r) => sum + r.grantsFound, 0)}`);
    console.log(`Total grants created: ${results.reduce((sum, r) => sum + r.grantsCreated, 0)}`);
    console.log(`Total grants updated: ${results.reduce((sum, r) => sum + r.grantsUpdated, 0)}`);
    console.log(`Total errors: ${results.reduce((sum, r) => sum + r.errors.length, 0)}\n`);

    return results;
  }

  /**
   * Run a single scraper and process its results
   */
  private async runScraper(scraper: GrantScraper): Promise<ScrapeResult> {
    const result: ScrapeResult = {
      source: scraper.name,
      grantsFound: 0,
      grantsCreated: 0,
      grantsUpdated: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      console.log(`\n[${scraper.name}] Starting scrape...`);
      const scrapedGrants = await scraper.scrape();
      result.grantsFound = scrapedGrants.length;

      console.log(`[${scraper.name}] Found ${scrapedGrants.length} grants`);
      console.log(`[${scraper.name}] Processing and saving to database...`);

      // Process each scraped grant
      for (const scrapedGrant of scrapedGrants) {
        try {
          await this.processGrant(scrapedGrant, result);
        } catch (error: any) {
          const errorMsg = `Failed to process grant "${scrapedGrant.title}": ${error.message}`;
          console.error(`[${scraper.name}] ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }

      console.log(`[${scraper.name}] Created: ${result.grantsCreated}, Updated: ${result.grantsUpdated}, Errors: ${result.errors.length}`);
    } catch (error: any) {
      const errorMsg = `Scraper failed: ${error.message}`;
      console.error(`[${scraper.name}] ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    return result;
  }

  /**
   * Process a single scraped grant - create or update in database
   */
  private async processGrant(scrapedGrant: ScrapedGrant, result: ScrapeResult): Promise<void> {
    // Check if grant already exists using externalId
    const existing = scrapedGrant.externalId
      ? await prisma.grant.findUnique({
          where: { externalId: scrapedGrant.externalId },
        })
      : null;

    if (existing) {
      // Update existing grant
      await prisma.grant.update({
        where: { id: existing.id },
        data: {
          title: scrapedGrant.title,
          description: scrapedGrant.description,
          category: scrapedGrant.category,
          valueMin: scrapedGrant.valueMin?.toString(),
          valueMax: scrapedGrant.valueMax?.toString(),
          deadline: scrapedGrant.deadline,
          status: scrapedGrant.status,
          eligibilityCriteria: scrapedGrant.eligibilityCriteria,
          keywords: scrapedGrant.keywords,
          url: scrapedGrant.applicationUrl, // Map applicationUrl to url field
          // Don't update embedding - keep the existing one
        },
      });
      result.grantsUpdated++;
      console.log(`  ✓ Updated: ${scrapedGrant.title.substring(0, 60)}...`);
    } else {
      // Create new grant with embedding
      let embedding: number[] | null = null;

      try {
        console.log(`  → Generating embedding for: ${scrapedGrant.title.substring(0, 60)}...`);
        embedding = await generateGrantEmbedding({
          title: scrapedGrant.title,
          description: scrapedGrant.description,
          category: scrapedGrant.category,
          keywords: scrapedGrant.keywords,
        });
        console.log(`  ✓ Embedding generated (${embedding.length} dimensions)`);
      } catch (error: any) {
        console.error(`  ✗ Failed to generate embedding: ${error.message}`);
        // Continue without embedding - can be generated later
      }

      await prisma.grant.create({
        data: {
          title: scrapedGrant.title,
          description: scrapedGrant.description,
          agency: scrapedGrant.agency as any,
          category: scrapedGrant.category,
          valueMin: scrapedGrant.valueMin?.toString(),
          valueMax: scrapedGrant.valueMax?.toString(),
          deadline: scrapedGrant.deadline,
          status: scrapedGrant.status,
          eligibilityCriteria: scrapedGrant.eligibilityCriteria,
          keywords: scrapedGrant.keywords,
          url: scrapedGrant.applicationUrl,
          externalId: scrapedGrant.externalId,
          embedding: embedding || undefined,
        },
      });
      result.grantsCreated++;
      console.log(`  ✓ Created: ${scrapedGrant.title.substring(0, 60)}...`);
    }
  }

  /**
   * Generate embeddings for grants that don't have them
   */
  async generateMissingEmbeddings(): Promise<number> {
    console.log("\n=== Generating Missing Embeddings ===\n");

    const grantsWithoutEmbeddings = await prisma.grant.findMany({
      where: {
        embedding: { isEmpty: true },
      },
    });

    console.log(`Found ${grantsWithoutEmbeddings.length} grants without embeddings`);

    let generated = 0;
    for (const grant of grantsWithoutEmbeddings) {
      try {
        console.log(`Generating embedding for: ${grant.title.substring(0, 60)}...`);

        const embedding = await generateGrantEmbedding({
          title: grant.title,
          description: grant.description,
          category: grant.category || "",
          keywords: grant.keywords,
        });

        await prisma.grant.update({
          where: { id: grant.id },
          data: { embedding },
        });

        generated++;
        console.log(`  ✓ Generated (${generated}/${grantsWithoutEmbeddings.length})`);
      } catch (error: any) {
        console.error(`  ✗ Failed: ${error.message}`);
      }
    }

    console.log(`\n=== Embedding Generation Complete: ${generated}/${grantsWithoutEmbeddings.length} ===\n`);
    return generated;
  }
}

/**
 * Helper function to run grant collection
 */
export async function runGrantCollection(useMockData = false): Promise<ScrapeResult[]> {
  const service = new GrantCollectionService(useMockData);
  const results = await service.collectGrants();

  // Generate embeddings for any grants that don't have them
  await service.generateMissingEmbeddings();

  return results;
}
