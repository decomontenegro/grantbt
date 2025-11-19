# 📁 Estrutura do Projeto GrantBR

```
grantbr/
│
├── 📄 Configuration Files
│   ├── package.json              # Root package.json (workspace config)
│   ├── pnpm-workspace.yaml       # pnpm workspace definition
│   ├── turbo.json                # Turborepo configuration
│   ├── .gitignore                # Git ignore rules
│   ├── .prettierrc               # Prettier config
│   ├── .prettierignore           # Prettier ignore rules
│   ├── .env.example              # Template for environment variables
│   │
│   ├── 📚 Documentation
│   ├── README.md                 # Project overview
│   ├── SETUP.md                  # Installation guide
│   ├── NEXT_STEPS.md             # What to do next
│   ├── PROJECT_STRUCTURE.md      # This file
│   └── docs/
│       └── ARCHITECTURE.md       # Detailed architecture docs
│
├── 🌐 apps/                      # Applications (frontend + backend)
│   │
│   └── web/                      # Next.js Frontend Application
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── .eslintrc.js
│       ├── .env.example
│       │
│       └── src/
│           ├── app/              # Next.js 14 App Router
│           │   ├── layout.tsx    # Root layout
│           │   ├── page.tsx      # Landing page
│           │   └── globals.css   # Global styles
│           │
│           ├── components/       # React components
│           │   └── ui/           # UI components (from @grantbr/ui)
│           │       ├── button.tsx
│           │       ├── card.tsx
│           │       ├── input.tsx
│           │       ├── label.tsx
│           │       └── badge.tsx
│           │
│           └── lib/              # Utilities
│               └── utils.ts      # Helper functions
│
├── 📦 packages/                  # Shared Packages (Monorepo)
│   │
│   ├── database/                 # Prisma Database Package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database schema (15+ models)
│   │   │
│   │   └── src/
│   │       ├── index.ts          # Prisma Client export
│   │       └── seed.ts           # Seed script (sample data)
│   │
│   ├── ui/                       # Shared UI Components Library
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .eslintrc.js
│   │   │
│   │   └── src/
│   │       ├── index.tsx         # Main export
│   │       ├── button.tsx        # Button component
│   │       ├── card.tsx          # Card component
│   │       ├── input.tsx         # Input component
│   │       ├── label.tsx         # Label component
│   │       ├── badge.tsx         # Badge component
│   │       ├── select.tsx        # (Placeholder)
│   │       ├── dialog.tsx        # (Placeholder)
│   │       ├── toast.tsx         # (Placeholder)
│   │       └── utils.ts          # cn() utility
│   │
│   ├── typescript-config/        # Shared TypeScript Configs
│   │   ├── package.json
│   │   ├── base.json             # Base TS config
│   │   ├── nextjs.json           # Next.js specific
│   │   └── node.json             # Node.js specific
│   │
│   └── eslint-config/            # Shared ESLint Configs
│       ├── package.json
│       ├── next.js               # Next.js ESLint rules
│       └── node.js               # Node.js ESLint rules
│
└── 🚀 Future Additions (To Be Created)
    │
    ├── apps/api/                 # Backend API (Node.js)
    │   ├── src/
    │   │   ├── server.ts
    │   │   ├── routes/           # API routes
    │   │   ├── services/         # Business logic
    │   │   ├── agents/           # AI agents (9 agents)
    │   │   ├── scrapers/         # Web scrapers
    │   │   └── jobs/             # Background jobs (BullMQ)
    │   └── package.json
    │
    └── packages/agents/          # AI Agents Package (Future)
        └── src/
            ├── matching.ts       # Matching Agent
            ├── eligibility.ts    # Eligibility Agent
            ├── generator.ts      # Proposal Generator Agent
            ├── evaluator.ts      # Evaluator Agent
            └── ...               # +5 more agents
```

## 📊 Estatísticas do Projeto (Atual)

### Arquivos Criados
- **Total**: ~50 arquivos
- **TypeScript/TSX**: 25+
- **Config**: 15+
- **Markdown**: 6

### Linhas de Código
- **Database Schema**: ~600 linhas (Prisma)
- **Frontend**: ~400 linhas (Next.js + React)
- **UI Components**: ~300 linhas
- **Config**: ~200 linhas
- **Docs**: ~2000 linhas

### Packages
- **Workspace Packages**: 6
  - `@grantbr/web` (Next.js app)
  - `@grantbr/database` (Prisma)
  - `@grantbr/ui` (Components)
  - `@grantbr/typescript-config`
  - `@grantbr/eslint-config`
  - `grantbr` (root)

- **Dependencies**: 465+ npm packages

## 🗄️ Database Schema Overview

### Core Tables (15 models)

```
┌─────────────────┐
│      User       │  ← Authentication
├─────────────────┤
│ Account         │  ← OAuth accounts
│ Session         │  ← User sessions
└─────────────────┘

┌─────────────────┐
│     Company     │  ← Company profiles
├─────────────────┤
│ CompanyMember   │  ← Team members
│ Project         │  ← Company projects
└─────────────────┘

┌─────────────────┐
│      Grant      │  ← Funding opportunities
└─────────────────┘

┌─────────────────┐
│   Application   │  ← Grant applications
├─────────────────┤
│ ApplicationVer. │  ← Version history
│ ExpertReview    │  ← Human reviews
└─────────────────┘

┌─────────────────┐
│     Mission     │  ← Post-approval tasks
├─────────────────┤
│   Deliverable   │  ← Mission outputs
└─────────────────┘

┌─────────────────┐
│  ScrapingJob    │  ← Scraping logs
│   AuditLog      │  ← System audit
└─────────────────┘
```

## 🎨 Frontend Pages (Planned)

### Public Pages
- `/` - Landing page ✅
- `/features` - Features overview
- `/pricing` - Pricing plans
- `/demo` - Live demo
- `/login` - Sign in
- `/signup` - Sign up

### Authenticated Pages
- `/dashboard` - Overview + recommended grants
- `/grants` - Browse all grants
- `/grants/[id]` - Grant details
- `/applications` - My applications
- `/applications/[id]` - Application editor
- `/missions` - Post-approval missions
- `/settings` - Company settings
- `/onboarding` - Onboarding wizard

## 🤖 AI Agents Architecture

```
┌──────────────────────────────────────────────┐
│         Agent Orchestrator (Controller)       │
└──────────────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│ Ingest │    │ Match  │    │ Elig.  │
│ Agent  │    │ Agent  │    │ Agent  │
└────────┘    └────────┘    └────────┘
    │              │              │
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│Generate│    │Evaluate│    │ Submit │
│ Agent  │    │ Agent  │    │ Agent  │
└────────┘    └────────┘    └────────┘
    │              │              │
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│Mission │    │Post-Ap.│    │  ...   │
│ Agent  │    │ Agent  │    │        │
└────────┘    └────────┘    └────────┘
```

## 📈 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router, RSC, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend (To Be Built)
- **Runtime**: Node.js 18+
- **Framework**: Express/Fastify
- **API**: tRPC (type-safe)
- **Auth**: NextAuth.js
- **Queue**: BullMQ + Redis

### Database & Storage
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Vector DB**: Pinecone (embeddings)
- **Cache**: Redis
- **Storage**: AWS S3

### AI/ML
- **LLMs**: OpenAI GPT-4, Anthropic Claude
- **Embeddings**: OpenAI text-embedding-3
- **Frameworks**: LangChain (future)

### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions (future)
- **Hosting**: Vercel (frontend), Railway (backend)

## 🎯 Current Status

✅ **Phase 1: Foundation** (100% Complete)
- Monorepo structure
- Database schema
- Frontend scaffolding
- UI components
- Documentation

⏳ **Phase 2: Core Features** (0% - Next Up)
- [ ] Authentication
- [ ] Onboarding
- [ ] Backend API
- [ ] Scrapers
- [ ] AI integration

📅 **Phase 3: Advanced Features** (0%)
- [ ] Matching agent
- [ ] Proposal generator
- [ ] Evaluator agent
- [ ] Mission management

🚀 **Phase 4: Polish & Launch** (0%)
- [ ] Testing
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Marketing site

---

**Last Updated**: 2025-11-15
**Version**: 0.1.0 (Initial Setup)
