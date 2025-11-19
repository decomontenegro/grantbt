/**
 * Script to generate embeddings for all grants in the database
 * Run with: pnpm --filter @grantbr/database generate-embeddings
 */

import { config } from "dotenv";
import { prisma } from "./index";
import OpenAI from "openai";

// Load .env from database package
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function generateGrantEmbeddings() {
  console.log("🧠 Generating embeddings for grants...\n");

  const grants = await prisma.grant.findMany({
    where: {
      embedding: {
        isEmpty: true, // Only process grants without embeddings
      },
    },
  });

  console.log(`Found ${grants.length} grants without embeddings\n`);

  for (const grant of grants) {
    try {
      console.log(`Processing: ${grant.title}`);

      // Build comprehensive text for embedding
      let text = `${grant.title}. ${grant.description}`;
      text += `. Agência: ${grant.agency}`;

      if (grant.category) {
        text += `. Categoria: ${grant.category}`;
      }

      if (grant.keywords && grant.keywords.length > 0) {
        text += `. Palavras-chave: ${grant.keywords.join(", ")}`;
      }

      // Include eligibility criteria in text
      if (grant.eligibilityCriteria) {
        const criteria = grant.eligibilityCriteria as any;

        if (criteria.prioritySectors) {
          text += `. Setores prioritários: ${criteria.prioritySectors.join(", ")}`;
        }

        if (criteria.priorityThemes) {
          text += `. Temas prioritários: ${criteria.priorityThemes.join(", ")}`;
        }

        if (criteria.companySize) {
          text += `. Portes elegíveis: ${criteria.companySize.join(", ")}`;
        }
      }

      console.log(`  Text length: ${text.length} characters`);

      // Generate embedding
      const embedding = await generateEmbedding(text);
      console.log(`  Embedding dimension: ${embedding.length}`);

      // Update grant
      await prisma.grant.update({
        where: { id: grant.id },
        data: { embedding },
      });

      console.log(`  ✅ Embedding saved\n`);
    } catch (error) {
      console.error(`  ❌ Failed to generate embedding for ${grant.title}:`, error);
    }
  }

  console.log("🎉 All embeddings generated!");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not set in environment");
    process.exit(1);
  }

  await generateGrantEmbeddings();
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
