# AI Features Setup Guide

## Current Status

The GrantBR platform has AI-powered grant matching ready to use, but requires a valid OpenAI API key to function.

### What's Already Working

- Web application on port 3001
- PostgreSQL database with real data
- NextAuth authentication
- Complete 8-step onboarding flow
- Company and project data persistence
- **Rule-based matching** (sector, size, budget alignment)

### What Needs OpenAI API Key

- Semantic similarity matching using embeddings
- AI-powered company-to-grant matching
- Automatic embedding generation

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Copy the key (it starts with `sk-...`)

### 2. Update Environment Variables

Edit `/apps/api/.env` and update the OpenAI API key:

```bash
OPENAI_API_KEY="sk-your-actual-key-here"
```

### 3. Restart the API Server

```bash
# Kill the current API server
pkill -f "@grantbr/api"

# Restart it
pnpm --filter @grantbr/api dev
```

### 4. Generate Embeddings for Existing Grants

Run the embedding generation script:

```bash
pnpm --filter @grantbr/api exec tsx src/scripts/generate-grant-embeddings.ts
```

This will:
- Find all grants without embeddings (currently 3)
- Generate OpenAI embeddings for each
- Update the database

Expected output:
```
📊 Found 3 grants without embeddings (out of 3 total)
🔄 Processing grant: FINEP Inovação...
   ✅ Success! (1/3)
🔄 Processing grant: FAPESP PIPE...
   ✅ Success! (2/3)
🔄 Processing grant: EMBRAPII...
   ✅ Success! (3/3)
```

### 5. Test Company Onboarding

Complete a new company onboarding. The system will automatically:
1. Create the company in the database
2. Trigger embedding generation via API call to `http://localhost:4000/api/ai/generate-embedding`
3. Generate semantic embeddings for the company profile

### 6. Verify AI Matching

1. Go to `/grants` page
2. You should see match scores that include:
   - **Semantic similarity** (40 points) - Now working with real AI
   - **Sector match** (20 points)
   - **Budget alignment** (15 points)
   - **Size eligibility** (10 points)
   - **Partnership bonus** (10 points)
   - **Past grant experience** (5 points)

## Technical Details

### Embedding Generation

- **Model**: `text-embedding-3-small` (OpenAI)
- **Dimension**: 1536
- **Storage**: PostgreSQL JSON array

### Company Embedding Text Format

```
{company.name}. {company.description}. Setor: {company.sector}.
Projetos: {project1.title}: {project1.description}. {project2...}
Áreas de interesse: {interests.join(", ")}.
```

### Grant Embedding Text Format

```
{grant.title}. {grant.description}. Agência: {grant.agency}. Categoria: {grant.category}.
```

### Matching Algorithm

Location: `/apps/api/src/services/matching.ts:57-100`

```typescript
async function calculateMatchScore(company, grant) {
  let score = 0;

  // 1. Semantic similarity (40 points) - AI-powered
  if (company.embedding && grant.embedding) {
    const similarity = cosineSimilarity(company.embedding, grant.embedding);
    score += similarity * 40;
  }

  // 2-6. Rule-based scoring (60 points)
  // ...
}
```

## Troubleshooting

### "401 Incorrect API key" Error

**Problem**: OpenAI API key is invalid or expired

**Solution**:
1. Verify the key in `/apps/api/.env`
2. Make sure there are no extra spaces or quotes
3. Get a fresh key from OpenAI dashboard

### "Module not found" Error When Running Script

**Problem**: Script can't find dependencies

**Solution**: Run from the API package:
```bash
pnpm --filter @grantbr/api exec tsx src/scripts/generate-grant-embeddings.ts
```

### Embeddings Not Generating During Onboarding

**Problem**: API server not running on port 4000

**Solution**:
```bash
# Check if API is running
curl http://localhost:4000/health

# Restart if needed
pnpm --filter @grantbr/api dev
```

### Match Scores Are Still 0% or Very Low

**Problem**: Companies/grants don't have embeddings yet

**Solution**:
1. Run the grant embedding script (see step 4)
2. Complete a new onboarding (or regenerate embeddings for existing companies)
3. Verify embeddings exist in database:
```sql
SELECT id, title, array_length(embedding, 1) as embedding_size
FROM "Grant"
WHERE embedding IS NOT NULL AND array_length(embedding, 1) > 0;
```

## API Endpoints

### Generate Embedding

```bash
POST http://localhost:4000/api/ai/generate-embedding
Content-Type: application/json

{
  "type": "company",  # or "project" or "grant"
  "entityId": "cm..."
}
```

**Response**:
```json
{
  "success": true
}
```

## Next Steps

Once you have a valid OpenAI API key and have generated embeddings:

1. The system will provide AI-powered semantic matching
2. Companies will get better grant recommendations
3. Match scores will be more accurate and meaningful
4. The platform will be fully operational with all AI features active

## Cost Estimation

- **Embeddings**: ~$0.0001 per 1K tokens
- Average company profile: ~200 tokens = $0.00002
- Average grant: ~300 tokens = $0.00003
- **Total for 100 companies + 100 grants**: ~$0.005 (less than 1 cent)

Embeddings are generated once and reused, so costs are minimal.
