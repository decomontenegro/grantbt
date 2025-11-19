import OpenAI from "openai";

// OpenAI client instance
// Note: OPENAI_API_KEY is loaded by server.ts via dotenv.config()
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
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

/**
 * Generate multiple embeddings in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate text using GPT-4
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gpt-4-turbo-preview"
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

/**
 * Extract keywords from text using GPT
 */
export async function extractKeywords(text: string): Promise<string[]> {
  const prompt = `Extract 5-10 relevant keywords from the following text. Return only the keywords as a comma-separated list.

Text: ${text}`;

  const response = await generateText(
    "You are a keyword extraction expert.",
    prompt,
    "gpt-3.5-turbo"
  );

  return response.split(",").map((k) => k.trim());
}

/**
 * Generate embedding for a grant opportunity
 */
export async function generateGrantEmbedding(grant: {
  title: string;
  description: string;
  category: string;
  keywords: string[];
}): Promise<number[]> {
  // Combine grant information into a coherent text for embedding
  const text = `
Título: ${grant.title}
Descrição: ${grant.description}
Categoria: ${grant.category}
Palavras-chave: ${grant.keywords.join(", ")}
  `.trim();

  return generateEmbedding(text);
}
