# 🎯 Próximos Passos - GrantBR

Você acabou de criar a fundação completa da plataforma GrantBR! Aqui estão os próximos passos recomendados para dar vida ao projeto.

## ✅ O Que Já Foi Feito

1. **Estrutura Monorepo Completa** ✓
   - Turborepo configurado
   - Next.js 14 frontend (`apps/web`)
   - Estrutura preparada para backend (`apps/api`)
   - Packages compartilhados (database, ui, configs)

2. **Database Schema Completo** ✓
   - 15+ modelos Prisma (User, Company, Grant, Application, Mission, etc.)
   - Suporte a multi-tenant
   - Campos para embeddings vetoriais
   - Audit logs e tracking

3. **Frontend Base** ✓
   - Next.js 14 com App Router
   - shadcn/ui componentes
   - Landing page profissional
   - Tailwind CSS configurado

4. **Documentação** ✓
   - SETUP.md (guia de instalação)
   - ARCHITECTURE.md (arquitetura detalhada)
   - README.md (overview do projeto)

## 🚀 Próximos Passos Imediatos

### Passo 1: Configure o Ambiente Local (15 min)

```bash
# 1. Configure PostgreSQL
createdb grantbr

# 2. Configure variáveis de ambiente
cp packages/database/.env.example packages/database/.env
# Edite packages/database/.env com sua DATABASE_URL

cp apps/web/.env.example apps/web/.env.local
# Edite apps/web/.env.local com suas credenciais

# 3. Execute migrations
cd /Users/decostudio/grantbr
pnpm --filter @grantbr/database db:push

# 4. (Opcional) Seed com dados de exemplo
pnpm --filter @grantbr/database db:seed
```

### Passo 2: Teste o Frontend (5 min)

```bash
pnpm dev
```

Acesse: http://localhost:3000

Você deverá ver:
- Landing page profissional
- Design system funcionando
- Navegação (ainda sem páginas internas)

### Passo 3: Implemente Autenticação (2-3 horas)

**Próxima tarefa prioritária**: NextAuth.js

**Arquivos a criar:**

1. `apps/web/src/app/api/auth/[...nextauth]/route.ts` - Configuração NextAuth
2. `apps/web/src/lib/auth.ts` - Helpers de autenticação
3. `apps/web/src/middleware.ts` - Proteção de rotas
4. `apps/web/src/app/(auth)/login/page.tsx` - Página de login
5. `apps/web/src/app/(auth)/signup/page.tsx` - Página de cadastro

**Exemplo básico:**

```typescript
// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@grantbr/database";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Implementar login com email/senha
    }),
  ],
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Passo 4: Implemente Onboarding (1 dia)

**Objetivo**: Wizard de 8 etapas para cadastro de empresa

**Arquivos a criar:**

1. `apps/web/src/app/(dashboard)/onboarding/page.tsx` - Container do wizard
2. `apps/web/src/components/onboarding/step-1-basic-info.tsx`
3. `apps/web/src/components/onboarding/step-2-company-details.tsx`
4. ... até step-8

**Dados a coletar:**
- CNPJ (validar via API Receita Federal)
- Informações da empresa (setor, porte, descrição)
- Projetos atuais/planejados
- Áreas de interesse
- Histórico de grants (se houver)

### Passo 5: Crie o Backend API (2-3 dias)

**Estrutura sugerida:**

```
apps/api/
├── src/
│   ├── server.ts           # Entry point
│   ├── routes/
│   │   ├── grants.ts       # GET /grants, GET /grants/:id
│   │   ├── applications.ts # CRUD de candidaturas
│   │   ├── companies.ts    # CRUD de empresas
│   │   └── ai.ts           # Endpoints de IA
│   ├── services/
│   │   ├── matching.ts     # Lógica de matching
│   │   ├── eligibility.ts  # Verificação de elegibilidade
│   │   └── generator.ts    # Geração de propostas
│   ├── jobs/
│   │   └── scraping.ts     # Background jobs de scraping
│   └── lib/
│       ├── openai.ts       # Cliente OpenAI
│       └── queue.ts        # BullMQ setup
├── package.json
└── tsconfig.json
```

**Stack recomendada:**
- Express ou Fastify
- tRPC (type-safe RPC entre frontend e backend)
- BullMQ (job queues)

### Passo 6: Implemente Primeiro Scraper - FINEP (2 dias)

**Objetivo**: Scraper automatizado para portal da FINEP

**Arquivo**: `apps/api/src/scrapers/finep.ts`

**Fluxo:**
1. Acessar https://www.finep.gov.br/chamadas-publicas
2. Extrair lista de editais ativos
3. Para cada edital:
   - Extrair título, descrição, prazo, valor
   - Fazer parse de PDF se necessário (pdf-parse)
   - Normalizar dados
4. Salvar no banco (upsert)

**Tecnologias:**
- Puppeteer ou Playwright (navegação)
- Cheerio (parse HTML)
- pdf-parse (extração de PDFs)

### Passo 7: Integre OpenAI (1 dia)

**Funcionalidades iniciais:**

1. **Embeddings** para matching semântico
   ```typescript
   import { OpenAI } from "openai";

   async function generateEmbedding(text: string) {
     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
     const response = await openai.embeddings.create({
       model: "text-embedding-3-small",
       input: text,
     });
     return response.data[0].embedding;
   }
   ```

2. **Geração de propostas** (GPT-4)
   ```typescript
   async function generateProposal(context: ProposalContext) {
     const completion = await openai.chat.completions.create({
       model: "gpt-4-turbo-preview",
       messages: [
         { role: "system", content: PROPOSAL_SYSTEM_PROMPT },
         { role: "user", content: buildUserPrompt(context) },
       ],
     });
     return completion.choices[0].message.content;
   }
   ```

### Passo 8: Crie Dashboard de Grants (2 dias)

**Página**: `apps/web/src/app/(dashboard)/grants/page.tsx`

**Features:**
- Listagem de grants catalogados
- Filtros (agência, valor, prazo, setor)
- Ordenação por relevância
- Badges de status (OPEN, CLOSING_SOON, etc.)
- Match score por grant
- Botão "Candidatar" → redireciona para eligibility check

### Passo 9: Implemente Matching Agent (3 dias)

**Lógica central:**

```typescript
async function findMatches(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { projects: true },
  });

  // 1. Busca semântica (embeddings)
  const companyEmbedding = company.embedding;
  const similarGrants = await vectorSearch(companyEmbedding, { limit: 50 });

  // 2. Filtro de elegibilidade
  const eligibleGrants = similarGrants.filter(grant =>
    checkBasicEligibility(company, grant)
  );

  // 3. Scoring multi-critério
  const scoredGrants = eligibleGrants.map(grant => ({
    ...grant,
    score: calculateMatchScore(company, grant),
  }));

  // 4. Ordenar por score
  return scoredGrants.sort((a, b) => b.score - a.score);
}
```

## 📅 Roadmap de 12 Semanas

### Semanas 1-2: Fundação ✅ (CONCLUÍDO)
- ✅ Setup monorepo
- ✅ Database schema
- ✅ Frontend base

### Semanas 3-4: Autenticação + Onboarding
- [ ] NextAuth.js completo
- [ ] Wizard de onboarding
- [ ] Dashboard básico

### Semanas 5-6: Backend + Scraping
- [ ] API REST/tRPC
- [ ] Scrapers (FINEP, FAPESP, EMBRAPII)
- [ ] CRON jobs

### Semanas 7-8: IA - Matching + Geração
- [ ] OpenAI integration
- [ ] Matching agent
- [ ] Eligibility agent
- [ ] Proposal generator v1

### Semanas 9-10: Proposal Editor
- [ ] Editor WYSIWYG (Tiptap)
- [ ] Versionamento
- [ ] Collaboration features

### Semanas 11-12: Polish + Deploy
- [ ] Evaluator agent
- [ ] Testing (E2E, unit)
- [ ] Deploy em staging
- [ ] Primeiros beta users

## 🎓 Recursos de Aprendizado

### Tutoriais Recomendados

1. **NextAuth.js**: https://next-auth.js.org/getting-started/example
2. **Prisma**: https://www.prisma.io/docs/getting-started
3. **tRPC**: https://trpc.io/docs/quickstart
4. **OpenAI API**: https://platform.openai.com/docs/quickstart
5. **Web Scraping**: https://www.zenrows.com/blog/puppeteer-tutorial

### Exemplos de Código Aberto

- **Taxonomia** (Next.js SaaS): https://github.com/shadcn/taxonomy
- **Cal.com** (Scheduling): https://github.com/calcom/cal.com
- **Dub.co** (Link management): https://github.com/dubinc/dub

## ⚙️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                  # Inicia tudo
pnpm --filter @grantbr/web dev     # Apenas frontend
pnpm --filter @grantbr/api dev     # Apenas backend (quando criado)

# Database
pnpm --filter @grantbr/database db:studio    # Prisma Studio
pnpm --filter @grantbr/database db:push      # Atualizar schema
pnpm --filter @grantbr/database db:seed      # Seed dados

# Build
pnpm build                # Build de produção
pnpm type-check           # Verificar tipos
pnpm lint                 # Lint código
pnpm format               # Formatar código
```

## 🐛 Debugging

Se encontrar problemas:

1. **Prisma Client não encontrado**
   ```bash
   pnpm --filter @grantbr/database db:generate
   ```

2. **Porta 3000 ocupada**
   ```bash
   PORT=3001 pnpm dev
   ```

3. **Erro de conexão PostgreSQL**
   - Verifique se PostgreSQL está rodando: `pg_isready`
   - Teste conexão: `psql -U postgres -d grantbr`

4. **TypeScript errors no Next.js**
   ```bash
   rm -rf .next
   pnpm dev
   ```

## 🎯 Meta de Curto Prazo (2 semanas)

**Objetivo**: Ter um MVP funcional com:
- ✅ Autenticação
- ✅ Onboarding
- ✅ 20+ grants catalogados (manual inicialmente)
- ✅ Matching básico
- ✅ Geração de proposta simples

**Demo target**: Mostrar para primeiros beta testers!

---

**Boa sorte! Você tem uma base sólida. Agora é codar! 💪🇧🇷**

Dúvidas? Consulte:
- `SETUP.md` para instalação
- `ARCHITECTURE.md` para decisões técnicas
- `README.md` para overview
