import * as cron from "node-cron";
import { runGrantCollection } from "../services/grant-scraper";

/**
 * GRANT COLLECTION SCHEDULER
 * Automatically runs grant collection twice per week using cron jobs
 */

export function initializeGrantCollectionScheduler() {
  console.log("\n[Scheduler] Initializing Grant Collection Scheduler...");

  // Schedule for Monday and Thursday at 2 AM
  // Cron format: minute hour day-of-month month day-of-week
  // "0 2 * * 1" = Every Monday at 2:00 AM
  // "0 2 * * 4" = Every Thursday at 2:00 AM

  const mondaySchedule = "0 2 * * 1"; // Every Monday at 2 AM
  const thursdaySchedule = "0 2 * * 4"; // Every Thursday at 2 AM

  // Monday job - Collect REAL grants from all sources
  cron.schedule(mondaySchedule, async () => {
    console.log("\n[Scheduler] 🔔 Monday grant collection triggered - REAL DATA");
    console.log("[Scheduler] Sources: FINEP, CNPq, FAPESP, EMBRAPII, BNDES, SEBRAE");
    try {
      const results = await runGrantCollection();
      const totalCreated = results.reduce((sum, r) => sum + r.grantsCreated, 0);
      const totalUpdated = results.reduce((sum, r) => sum + r.grantsUpdated, 0);
      console.log(`[Scheduler] ✅ Monday collection complete: ${totalCreated} new grants created, ${totalUpdated} updated`);
    } catch (error: any) {
      console.error("[Scheduler] ❌ Monday collection failed:", error.message);
    }
  });

  // Thursday job - Collect REAL grants from all sources
  cron.schedule(thursdaySchedule, async () => {
    console.log("\n[Scheduler] 🔔 Thursday grant collection triggered - REAL DATA");
    console.log("[Scheduler] Sources: FINEP, CNPq, FAPESP, EMBRAPII, BNDES, SEBRAE");
    try {
      const results = await runGrantCollection();
      const totalCreated = results.reduce((sum, r) => sum + r.grantsCreated, 0);
      const totalUpdated = results.reduce((sum, r) => sum + r.grantsUpdated, 0);
      console.log(`[Scheduler] ✅ Thursday collection complete: ${totalCreated} new grants created, ${totalUpdated} updated`);
    } catch (error: any) {
      console.error("[Scheduler] ❌ Thursday collection failed:", error.message);
    }
  });

  console.log("[Scheduler] Scheduled jobs:");
  console.log("  - Monday at 2:00 AM (cron: 0 2 * * 1)");
  console.log("  - Thursday at 2:00 AM (cron: 0 2 * * 4)");
  console.log("[Scheduler] Scheduler initialized successfully\n");
}

/**
 * For testing: Run grant collection every 5 minutes
 * ONLY USE IN DEVELOPMENT
 */
export function initializeTestScheduler() {
  console.log("\n[Scheduler] Initializing TEST Grant Collection Scheduler...");
  console.log("[Scheduler] WARNING: This will run grant collection every 5 minutes!");

  // Every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("\n[Scheduler] Test collection triggered (5-minute interval)");
    try {
      const results = await runGrantCollection(true); // Use mock data for testing
      console.log(`[Scheduler] Test collection complete: ${results.reduce((sum, r) => sum + r.grantsCreated, 0)} new grants created`);
    } catch (error: any) {
      console.error("[Scheduler] Test collection failed:", error.message);
    }
  });

  console.log("[Scheduler] Test scheduler initialized: Running every 5 minutes\n");
}
