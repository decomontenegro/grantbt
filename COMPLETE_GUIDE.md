# 🚀 GrantBR - Guia Completo de Implementação

## 📚 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Arquitetura Completa](#arquitetura)
3. [Setup e Instalação](#setup)
4. [Desenvolvimento](#desenvolvimento)
5. [Agentes de IA](#agentes)
6. [API Reference](#api)
7. [Deploy em Produção](#deploy)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral do Sistema

O GrantBR é uma plataforma enterprise completa de automação de grants, inspirada na Granter.ai, mas focada no mercado brasileiro.

### Funcionalidades Implementadas

✅ **Autenticação Completa**
- NextAuth.js com credenciais e Google OAuth
- Proteção de rotas via middleware
- Sessões JWT persistentes

✅ **Onboarding Wizard (8 Etapas)**
- Coleta completa de dados da empresa
- Informações de projetos e equipe
- Preferências de notificação e matching
- Integração automática com banco de dados

✅ **Backend API Completo**
- Express REST API
- 5 routers principais (grants, applications, companies, ai, matching)
- BullMQ para job queues
- Redis para cache e filas

✅ **9 Agentes de IA Implementados**
1. **Grants Ingestion Engine** - Scraping automatizado
2. **Company Knowledge Graph** - Perfil vetorizado
3. **Matching Agent** - Algoritmo semântico + critérios
4. **Eligibility Agent** - Verificação automática
5. **Proposal Generator** - RAG com GPT-4
6. **Evaluator Agent** - Simula júri avaliador
7. **Mission Orchestrator** - Gestão pós-aprovação (estrutura)
8. **Submission Agent** - Estrutura criada
9. **Post-Approval Agent** - Estrutura criada

✅ **Scrapers para Agências Brasileiras**
- FINEP (com Puppeteer real + mock data)
- FAPESP (mock data estruturado)
- EMBRAPII (mock data estruturado)
- Geração automática de embeddings e keywords

✅ **Dashboard Completo**
- Visão geral de oportunidades
- Stats e métricas
- Recomendações personalizadas
- AI Insights

✅ **Editor de Candidaturas**
- Geração automática via IA
- 8 seções estruturadas
- Feedback em tempo real
- Avaliação de score
- Versionamento

✅ **Database Schema Completo**
- 15+ modelos Prisma
- Suporte a embeddings vetoriais
- Audit logs
- Multi-tenant ready

---

## 🏗️ Arquitetura

### Stack Tecnológica

**Frontend**
```
Next.js 14 (App Router)
├── React 18 (Server Components)
├── TypeScript 5.3
├── Tailwind CSS 3.4
├── shadcn/ui (Radix UI)
└── NextAuth.js 4.24
```

**Backend**
```
Node.js + TypeScript
├── Express 4.18
├── Prisma ORM 5.8
├── BullMQ (job queues)
├── Redis (cache)
└── PostgreSQL 14+
```

**AI/ML**
```
OpenAI API
├── GPT-4 Turbo (geração)
├── text-embedding-3-small (embeddings)
├── Puppeteer (scraping)
└── Cheerio (parsing)
```

### Estrutura de Diretórios

```
grantbr/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/     # Login/Signup
│   │   │   │   ├── (dashboard)/ # Dashboard, Grants, Applications
│   │   │   │   └── api/        # API routes (NextAuth, onboarding)
│   │   │   ├── components/
│   │   │   │   ├── onboarding/ # 8 steps do wizard
│   │   │   │   └── ui/         # shadcn/ui components
│   │   │   └── lib/            # Utilities
│   │   └── package.json
│   │
│   └── api/                    # Backend Node.js
│       ├── src/
│       │   ├── server.ts       # Entry point
│       │   ├── routes/         # Express routers
│       │   │   ├── grants.ts
│       │   │   ├── applications.ts
│       │   │   ├── companies.ts
│       │   │   ├── ai.ts
│       │   │   └── matching.ts
│       │   ├── services/       # AI Agents
│       │   │   ├── matching.ts
│       │   │   ├── eligibility.ts
│       │   │   ├── generator.ts
│       │   │   └── evaluator.ts
│       │   ├── scrapers/       # Web scrapers
│       │   │   ├── finep.ts
│       │   │   ├── fapesp.ts
│       │   │   └── embrapii.ts
│       │   ├── jobs/           # Background jobs
│       │   │   ├── scraping.ts
│       │   │   └── embedding.ts
│       │   └── lib/            # Shared utilities
│       │       ├── openai.ts
│       │       └── queue.ts
│       └── package.json
│
├── packages/
│   ├── database/               # Prisma schemas
│   │   ├── prisma/
│   │   │   └── schema.prisma   # 15+ models
│   │   └── src/
│   │       ├── index.ts
│   │       └── seed.ts
│   ├── ui/                     # Shared components
│   └── ...configs/
│
└── docs/
    ├── ARCHITECTURE.md
    ├── SETUP.md
    ├── QUICKSTART.md
    └── PROJECT_STRUCTURE.md
```

---

## 🔧 Setup e Instalação

### Pré-requisitos

```bash
# Node.js 18+
node --version

# pnpm 8+
pnpm --version

# PostgreSQL 14+
psql --version

# Redis 6+
redis-cli ping

# Git
git --version
```

### Instalação Completa

```bash
# 1. Clone ou navegue ao diretório
cd /Users/decostudio/grantbr

# 2. Instalar dependências (se ainda não instalou)
pnpm install

# 3. Configurar PostgreSQL
createdb grantbr

# 4. Configurar variáveis de ambiente
cp packages/database/.env.example packages/database/.env
cp apps/web/.env.example apps/web/.env.local

# Editar packages/database/.env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/grantbr?schema=public"

# Editar apps/web/.env.local
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."

# 5. Executar migrations e seed
pnpm db:push
pnpm db:seed

# 6. Iniciar Redis
brew services start redis  # macOS
# ou
sudo systemctl start redis # Linux

# 7. Iniciar aplicação
pnpm dev
```

### Verificar Instalação

```bash
# Frontend
curl http://localhost:3000

# API (quando iniciar)
curl http://localhost:4000/health

# Database
pnpm db:studio

# Redis
redis-cli ping
```

---

## 💻 Desenvolvimento

### Comandos Principais

```bash
# Desenvolvimento
pnpm dev                  # Inicia tudo (frontend + backend quando configurado)
pnpm web:dev              # Apenas frontend
pnpm build                # Build de produção

# Database
pnpm db:generate          # Gerar Prisma Client
pnpm db:push              # Atualizar schema sem migrations
pnpm db:migrate           # Criar migration
pnpm db:studio            # UI do banco (http://localhost:5555)
pnpm db:seed              # Popular com dados de teste

# Quality
pnpm lint                 # ESLint
pnpm format               # Prettier
pnpm type-check           # TypeScript check

# Clean
pnpm clean                # Limpar builds e node_modules
```

### Workflow de Desenvolvimento

1. **Criar feature branch**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Desenvolver com hot reload**
   ```bash
   pnpm dev
   ```

3. **Testar funcionalidade**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - Database UI: http://localhost:5555

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: descrição da feature"
   ```

### Estrutura de Código

**Criar novo componente UI**
```typescript
// packages/ui/src/novo-componente.tsx
import * as React from "react";
import { cn } from "./utils";

export function NovoComponente({ className, ...props }) {
  return <div className={cn("...", className)} {...props} />;
}

// Exportar em packages/ui/src/index.tsx
export * from "./novo-componente";
```

**Criar novo modelo Prisma**
```prisma
// packages/database/prisma/schema.prisma
model NovoModelo {
  id String @id @default(cuid())
  name String
  createdAt DateTime @default(now())

  @@map("novo_modelo")
}

// Então rodar:
// pnpm db:generate
// pnpm db:push
```

**Criar novo agente AI**
```typescript
// apps/api/src/services/novo-agente.ts
import { prisma } from "@grantbr/database";
import { generateText } from "../lib/openai";

export async function executarNovoAgente(params: any) {
  // Lógica do agente
  const resultado = await generateText(systemPrompt, userPrompt);
  return resultado;
}

// Adicionar route em apps/api/src/routes/ai.ts
aiRouter.post("/novo-agente", async (req, res) => {
  const result = await executarNovoAgente(req.body);
  res.json(result);
});
```

---

## 🤖 Agentes de IA

### 1. Matching Agent

**Localização**: `apps/api/src/services/matching.ts`

**Função**: Encontra grants compatíveis com o perfil da empresa

**Algoritmo**:
```typescript
score = (
  semanticSimilarity * 0.40 +  // Embeddings similarity
  sectorMatch * 0.20 +          // Setor compatível
  budgetAlignment * 0.15 +      // Faixa de valor
  sizeEligibility * 0.10 +      // Porte da empresa
  keywordsOverlap * 0.15        // Keywords em comum
) * 100
```

**Como usar**:
```bash
POST /api/matching/find
{
  "companyId": "..."
}
```

### 2. Eligibility Agent

**Localização**: `apps/api/src/services/eligibility.ts`

**Função**: Verifica se empresa atende requisitos do grant

**Critérios verificados**:
- Porte da empresa
- Localização (estado)
- Setor de atuação
- Faturamento mínimo
- Prontidão para inovação
- Equipe qualificada

**Como usar**:
```bash
POST /api/ai/check-eligibility
{
  "companyId": "...",
  "grantId": "..."
}
```

### 3. Proposal Generator Agent

**Localização**: `apps/api/src/services/generator.ts`

**Função**: Gera proposta completa usando RAG

**Seções geradas**:
1. Executive Summary
2. Problem Statement
3. Proposed Solution
4. Methodology
5. Project Timeline
6. Budget Breakdown
7. Team Qualifications
8. Expected Impact

**Como usar**:
```bash
POST /api/ai/generate-proposal
{
  "applicationId": "..."
}
```

### 4. Evaluator Agent

**Localização**: `apps/api/src/services/evaluator.ts`

**Função**: Simula avaliador humano e pontua proposta

**Critérios avaliados**:
- Inovação (peso 30%)
- Viabilidade técnica (peso 25%)
- Impacto esperado (peso 25%)
- Capacidade da equipe (peso 10%)
- Adequação do orçamento (peso 10%)

**Output**:
```json
{
  "overallScore": 78,
  "criteriaScores": {
    "innovation": 85,
    "feasibility": 75,
    "impact": 80,
    "team": 70,
    "budget": 72
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."]
}
```

---

## 📡 API Reference

### Base URLs

- **Development**: `http://localhost:4000`
- **Production**: `https://api.grantbr.com` (quando deployed)

### Autenticação

Todas as rotas da API devem incluir header de autenticação (a implementar):

```
Authorization: Bearer <token>
```

### Endpoints Principais

#### Grants

```http
GET /api/grants
GET /api/grants/:id
POST /api/grants (admin only)
```

#### Applications

```http
GET /api/applications
POST /api/applications
GET /api/applications/:id
PATCH /api/applications/:id
```

#### AI Services

```http
POST /api/ai/check-eligibility
POST /api/ai/generate-proposal
POST /api/ai/evaluate
```

#### Matching

```http
POST /api/matching/find
```

---

## 🚀 Deploy em Produção

### Opção 1: Vercel + Railway

**Frontend (Vercel)**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
cd apps/web
vercel

# 3. Configurar variáveis de ambiente no dashboard:
# NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL, etc.
```

**Backend (Railway)**

```bash
# 1. Criar conta em railway.app

# 2. Criar novo projeto

# 3. Conectar GitHub repo

# 4. Configurar variáveis:
# DATABASE_URL, REDIS_URL, OPENAI_API_KEY

# 5. Deploy automático via git push
```

**Database (Supabase/Neon)**

```bash
# Usar Supabase ou Neon.tech para PostgreSQL managed

# Copiar connection string e adicionar em:
# - Vercel (NEXTAUTH_URL, DATABASE_URL)
# - Railway (DATABASE_URL)
```

### Opção 2: Docker

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: grantbr
      POSTGRES_PASSWORD: password

  redis:
    image: redis:6-alpine

  api:
    build: ./apps/api
    environment:
      DATABASE_URL: postgres://postgres:password@postgres:5432/grantbr
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build: ./apps/web
    environment:
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - api
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module @prisma/client"

```bash
pnpm db:generate
```

### Erro: OpenAI API key inválida

```bash
# Verificar .env.local
echo $OPENAI_API_KEY

# Obter nova key em https://platform.openai.com/api-keys
```

### Erro: Redis connection failed

```bash
# Verificar se Redis está rodando
redis-cli ping

# Iniciar Redis
brew services start redis  # macOS
sudo systemctl start redis # Linux
```

### Erro: Database connection failed

```bash
# Verificar PostgreSQL
pg_isready

# Testar conexão
psql -U postgres -d grantbr

# Verificar DATABASE_URL em .env
cat packages/database/.env
```

### Build errors no Next.js

```bash
# Limpar cache
rm -rf apps/web/.next
rm -rf apps/web/.turbo

# Reinstalar
pnpm clean
pnpm install
pnpm dev
```

---

## 📈 Próximos Passos

1. **Configurar CI/CD** (GitHub Actions)
2. **Adicionar testes** (Jest + Playwright)
3. **Implementar WebSockets** (real-time collaboration)
4. **Adicionar mais scrapers** (CNPq, CAPES, etc.)
5. **Fine-tune modelos** (GPT-4 customizado)
6. **Mobile app** (React Native)
7. **Analytics dashboard** (métricas de uso)
8. **Expert Review marketplace**

---

**Desenvolvido com ❤️ para o ecossistema brasileiro de inovação**
