import { prisma } from "@grantbr/database";
import { generateEmbedding } from "../lib/openai";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from API .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function generateGrantEmbeddings() {
  try {
    console.log("🔍 Finding grants without embeddings...");

    // Find all grants
    const allGrants = await prisma.grant.findMany();

    // Filter to those with empty or missing embeddings
    const grants = allGrants.filter(
      (g: any) => !g.embedding || (Array.isArray(g.embedding) && g.embedding.length === 0)
    );

    console.log(`📊 Found ${grants.length} grants without embeddings (out of ${allGrants.length} total)`);

    if (grants.length === 0) {
      console.log("✅ All grants already have embeddings!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const grant of grants) {
      try {
        console.log(`\n🔄 Processing grant: ${grant.title}`);
        console.log(`   Agency: ${grant.agency}`);

        // Build text representation for embedding
        const text = `${grant.title}. ${grant.description}. Agência: ${grant.agency}. Categoria: ${grant.category}.`;

        console.log(`   Generating embedding...`);
        const embedding = await generateEmbedding(text);

        console.log(`   Updating database...`);
        await prisma.grant.update({
          where: { id: grant.id },
          data: { embedding },
        });

        successCount++;
        console.log(`   ✅ Success! (${successCount}/${grants.length})`);

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        errorCount++;
        console.error(`   ❌ Error processing grant ${grant.id}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Summary:");
    console.log(`   Total grants: ${grants.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateGrantEmbeddings()
  .then(() => {
    console.log("\n✅ Script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
