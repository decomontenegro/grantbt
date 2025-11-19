# 🏛️ Arquitetura da Plataforma GrantBR

## Visão Geral

A GrantBR é uma plataforma enterprise de automação de grants construída com arquitetura multi-agente, inspirada na Granter.ai mas focada no mercado brasileiro.

## 🎯 Princípios Arquiteturais

1. **Modular**: Monorepo com packages independentes e reutilizáveis
2. **Type-Safe**: TypeScript end-to-end com validação Zod
3. **AI-First**: Agentes de IA como cidadãos de primeira classe
4. **Event-Driven**: Comunicação assíncrona via filas (BullMQ)
5. **Scalable**: Pronto para crescer de MVP a enterprise

## 📊 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js 14 App Router + React + Tailwind + shadcn/ui      │
└──────────────────────┬──────────────────────────────────────┘
                       │ tRPC/GraphQL
┌──────────────────────┴──────────────────────────────────────┐
│                       BACKEND API                            │
│          Node.js + TypeScript + Express/Fastify             │
├─────────────────────────────────────────────────────────────┤
│                    AGENT ORCHESTRATOR                        │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Ingestion │  │  Matching │  │ Generator│  │Evaluator │ │
│  │   Agent   │  │   Agent   │  │  Agent   │  │  Agent   │ │
│  └───────────┘  └───────────┘  └──────────┘  └──────────┘ │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │Eligibility│  │  Mission  │  │Submission│  │Post-Appr.│ │
│  │   Agent   │  │   Agent   │  │  Agent   │  │  Agent   │ │
│  └───────────┘  └───────────┘  └──────────┘  └──────────┘ │
│                         ↕                                    │
│                   Job Queue (BullMQ + Redis)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │  Pinecone  │  │   Redis    │            │
│  │  (Prisma)  │  │  (Vector)  │  │  (Cache)   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  OpenAI API · Anthropic API · AWS S3 · Stripe · Gov APIs    │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Camadas da Aplicação

### 1. Frontend (apps/web)

**Responsabilidades:**
- Interface do usuário (dashboards, forms, editors)
- State management (React Context/Zustand)
- Client-side routing (Next.js App Router)
- Server Actions para mutations simples

**Stack:**
- Next.js 14 (App Router, RSC, Server Actions)
- React 18 (Hooks, Suspense)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod (validação)
- Lucide Icons

**Principais Páginas:**
- `/` - Landing page
- `/dashboard` - Overview de oportunidades
- `/grants` - Catálogo de grants
- `/applications` - Candidaturas da empresa
- `/missions` - Missões pós-aprovação
- `/settings` - Configurações e perfil

### 2. Backend API (apps/api)

**Responsabilidades:**
- Lógica de negócio
- Orquestração de agentes
- Autenticação/Autorização
- API endpoints (REST ou tRPC)
- WebSockets para real-time (opcional)

**Stack (a implementar):**
- Node.js + TypeScript
- Express ou Fastify
- tRPC (type-safe RPC)
- NextAuth.js (auth)
- BullMQ (job queues)

**Principais Módulos:**
- `auth/` - Autenticação e sessões
- `agents/` - Lógica dos 9 agentes
- `scrapers/` - Web scrapers para editais
- `ai/` - Integrações com LLMs
- `jobs/` - Definições de background jobs

### 3. Database Layer (packages/database)

**Responsabilidades:**
- Schema definição (Prisma)
- Migrations
- Seed scripts
- Type-safe query builders

**Stack:**
- Prisma ORM
- PostgreSQL 14+
- pgvector extension (para embeddings - opcional)

**Principais Entidades:**
- User, Company, CompanyMember
- Grant, Application, ApplicationVersion
- Mission, Deliverable
- ScrapingJob, AuditLog

### 4. UI Components (packages/ui)

**Responsabilidades:**
- Componentes reutilizáveis
- Design system
- Theming

**Stack:**
- React
- Radix UI primitives
- CVA (class-variance-authority)
- Tailwind CSS

## 🤖 Arquitetura de Agentes

Cada agente é um módulo independente com responsabilidade única:

### 1. Grants Ingestion Engine

```typescript
class GrantsIngestionAgent {
  async scrape(agency: GrantAgency): Promise<Grant[]>
  async normalize(rawData: any): Promise<Grant>
  async generateEmbedding(grant: Grant): Promise<Float32Array>
  async upsertGrant(grant: Grant): Promise<void>
}
```

**Trigger**: CRON diário (00:00 BRT)
**Output**: Grants atualizados no DB

### 2. Matching Agent

```typescript
class MatchingAgent {
  async findMatches(company: Company): Promise<GrantMatch[]>
  async calculateScore(company: Company, grant: Grant): Promise<number>
  async semanticSearch(query: string): Promise<Grant[]>
}
```

**Trigger**: Onboarding completado, novo grant, request do usuário
**Output**: Lista ranqueada de grants (score 0-100)

### 3. Eligibility Agent

```typescript
class EligibilityAgent {
  async checkEligibility(company: Company, grant: Grant): Promise<EligibilityResult>
  async parseCriteria(grant: Grant): Promise<Criterion[]>
  async validateCriterion(company: Company, criterion: Criterion): Promise<boolean>
}
```

**Trigger**: Usuário inicia candidatura
**Output**: Checklist de critérios ✓/✗

### 4. Proposal Generation Agent

```typescript
class ProposalGeneratorAgent {
  async generateDraft(application: Application): Promise<ProposalDraft>
  async improveSection(section: string, feedback: string): Promise<string>
  async applyTemplate(grant: Grant): Promise<Template>
}
```

**Trigger**: Usuário clica "Gerar Proposta"
**Output**: Rascunho completo (JSON + markdown)

### 5. Evaluator Agent

```typescript
class EvaluatorAgent {
  async evaluate(application: Application): Promise<EvaluationResult>
  async scoreSection(section: string, criteria: string[]): Promise<number>
  async detectAnomalies(application: Application): Promise<Anomaly[]>
  async suggestImprovements(evaluation: EvaluationResult): Promise<Suggestion[]>
}
```

**Trigger**: Após geração de draft, request do usuário
**Output**: Score 0-100 + feedback estruturado

### 6. Submission Agent

```typescript
class SubmissionAgent {
  async fillForm(application: Application, portal: Portal): Promise<void>
  async uploadDocuments(files: File[]): Promise<void>
  async submitApplication(application: Application): Promise<SubmissionResult>
  async trackStatus(protocol: string): Promise<ApplicationStatus>
}
```

**Trigger**: Usuário aprova submissão
**Output**: Protocolo + confirmação

### 7. Mission Orchestrator

```typescript
class MissionOrchestratorAgent {
  async createMissions(application: Application): Promise<Mission[]>
  async generateDeliverable(mission: Mission): Promise<Deliverable>
  async notifyDeadlines(): Promise<void>
  async validateCompliance(mission: Mission): Promise<ComplianceCheck>
}
```

**Trigger**: Aprovação de grant, chegada de deadline
**Output**: Tarefas agendadas, documentos gerados

## 🔄 Fluxos de Dados Principais

### Fluxo 1: Onboarding

```
User Sign Up
    ↓
Wizard (8 steps)
    ↓
Company Profile Created
    ↓
Generate Embeddings (OpenAI)
    ↓
Trigger Matching Agent
    ↓
Display Recommended Grants
```

### Fluxo 2: Criar Candidatura

```
User selects Grant
    ↓
Eligibility Check
    ↓
User answers questions
    ↓
Trigger Proposal Generator (GPT-4)
    ↓
RAG: Retrieve similar proposals
    ↓
Generate Draft
    ↓
Evaluator Agent scores draft
    ↓
User reviews & edits
    ↓
Iterative improvements
    ↓
Final approval
    ↓
Submission Agent
```

### Fluxo 3: Scraping de Grants

```
CRON trigger (daily)
    ↓
Queue scraping jobs (BullMQ)
    ↓
For each agency:
  Scraper.run()
    ↓
  Parse HTML/PDF
    ↓
  Normalize data
    ↓
  Generate embeddings
    ↓
  Upsert to DB
    ↓
Send notification (new grants found)
```

## 🔐 Segurança

### Autenticação

- NextAuth.js com múltiplos providers
- JWT tokens (httpOnly cookies)
- RBAC (User, Admin, Consultant roles)

### Autorização

```typescript
// Middleware example
async function requireCompanyMember(userId: string, companyId: string) {
  const member = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
  if (!member) throw new ForbiddenError();
}
```

### Dados Sensíveis

- Environment variables para API keys
- Encryption at rest (PostgreSQL)
- HTTPS only em produção
- LGPD compliance (data retention policies)

## 📈 Escalabilidade

### Horizontal Scaling

- Stateless API servers (pode rodar N instâncias)
- BullMQ workers podem ser escalados independentemente
- Database connection pooling (Prisma)

### Caching Strategy

- Redis para:
  - Session storage
  - Rate limiting
  - Cache de grants (TTL: 1 hora)
  - Cache de embeddings recém-gerados

### Database Optimization

- Indexes estratégicos (ver schema.prisma)
- Partitioning por data (grants históricos)
- Read replicas para queries pesadas (futuro)

## 🧪 Testing Strategy

```
packages/database/
  └── tests/
      ├── unit/           # Prisma queries
      └── integration/    # Full DB flows

apps/api/
  └── tests/
      ├── unit/           # Business logic
      ├── integration/    # API endpoints
      └── e2e/            # Full user flows

apps/web/
  └── tests/
      ├── unit/           # Components
      └── e2e/            # Playwright
```

## 📦 Deployment

### Development

```bash
pnpm dev
```

### Staging

- Vercel (frontend preview)
- Railway (backend + DB)
- Separate environment vars

### Production

- **Frontend**: Vercel (CDN, edge functions)
- **Backend**: Railway/Fly.io (containerizado)
- **Database**: Supabase ou AWS RDS
- **Redis**: Upstash ou Redis Cloud
- **Vector DB**: Pinecone managed
- **Storage**: AWS S3
- **Monitoring**: Sentry, LogRocket, Posthog

## 🔮 Evolução Futura

### Fase 2 (Meses 4-6)

- [ ] WebSockets para real-time collaboration
- [ ] Multi-tenant completo (workspaces)
- [ ] API pública para integrações

### Fase 3 (Meses 7-9)

- [ ] Mobile app (React Native)
- [ ] Offline-first (PWA)
- [ ] Advanced analytics dashboard

### Fase 4 (Meses 10-12)

- [ ] White-label solution
- [ ] Enterprise SSO (SAML)
- [ ] Custom ML models (fine-tuned)

---

**Documento vivo - atualizar conforme implementação evolui**
