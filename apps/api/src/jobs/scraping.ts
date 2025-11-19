import { prisma } from "@grantbr/database";
import { scrapeFINEP } from "../scrapers/finep";
import { scrapeFAPESP } from "../scrapers/fapesp";
import { scrapeEMBRAPII } from "../scrapers/embrapii";

export async function runScraper(agency: string) {
  console.log(`\n🚀 Starting scraper for ${agency}...`);

  const job = await prisma.scrapingJob.create({
    data: {
      agency,
      status: "running",
    },
  });

  try {
    let grantsFound = 0;

    switch (agency) {
      case "FINEP":
        grantsFound = await scrapeFINEP();
        break;
      case "FAPESP":
        grantsFound = await scrapeFAPESP();
        break;
      case "EMBRAPII":
        grantsFound = await scrapeEMBRAPII();
        break;
      default:
        throw new Error(`Unknown agency: ${agency}`);
    }

    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        grantsFound,
        grantsNew: grantsFound, // Simplified - in production, track actual new vs updated
        completedAt: new Date(),
      },
    });

    console.log(`✅ Scraping job for ${agency} completed successfully\n`);

    return { success: true, grantsFound };
  } catch (error: any) {
    console.error(`❌ Scraping job for ${agency} failed:`, error);

    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: error.message,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}
