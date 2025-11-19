import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

// Scraping Queue
export const scrapingQueue = new Queue("scraping", { connection });

// Embedding Generation Queue
export const embeddingQueue = new Queue("embedding", { connection });

// Matching Queue
export const matchingQueue = new Queue("matching", { connection });

// Initialize workers
export function initializeWorkers() {
  // Scraping worker
  const scrapingWorker = new Worker(
    "scraping",
    async (job) => {
      const { agency } = job.data;
      console.log(`Processing scraping job for ${agency}...`);

      // Import dynamically to avoid circular dependencies
      const { runScraper } = await import("../jobs/scraping");
      return await runScraper(agency);
    },
    { connection }
  );

  // Embedding worker
  const embeddingWorker = new Worker(
    "embedding",
    async (job) => {
      const { type, entityId } = job.data;
      console.log(`Processing embedding job for ${type}:${entityId}...`);

      const { generateEntityEmbedding } = await import("../jobs/embedding");
      return await generateEntityEmbedding(type, entityId);
    },
    { connection }
  );

  // Matching worker
  const matchingWorker = new Worker(
    "matching",
    async (job) => {
      const { companyId } = job.data;
      console.log(`Processing matching job for company ${companyId}...`);

      const { runMatching } = await import("../services/matching");
      return await runMatching(companyId);
    },
    { connection }
  );

  console.log("✅ Workers initialized");

  return { scrapingWorker, embeddingWorker, matchingWorker };
}

// Schedule scraping jobs
export async function scheduleScraping(agency: string) {
  await scrapingQueue.add(`scrape-${agency}`, { agency });
}

// Schedule embedding generation
export async function scheduleEmbedding(type: string, entityId: string) {
  await embeddingQueue.add(`embed-${type}-${entityId}`, { type, entityId });
}

// Schedule matching
export async function scheduleMatching(companyId: string) {
  await matchingQueue.add(`match-${companyId}`, { companyId });
}
