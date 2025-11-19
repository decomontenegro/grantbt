# ⚡ Quick Start - GrantBR

Guia rápido para começar a desenvolver em **5 minutos**.

## 🚀 Setup Rápido

### 1. Instalar Dependências (já feito ✅)

```bash
cd /Users/decostudio/grantbr
pnpm install
```

### 2. Configurar PostgreSQL

**Opção A: PostgreSQL Local**

```bash
# Criar banco de dados
createdb grantbr

# Configurar .env
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/grantbr?schema=public"' > packages/database/.env
```

**Opção B: Supabase (Cloud - Grátis)**

1. Criar conta: https://supabase.com
2. Criar novo projeto
3. Copiar CONNECTION STRING
4. Colar em `packages/database/.env`

### 3. Executar Migrations

```bash
pnpm db:push
```

### 4. (Opcional) Seed com Dados de Exemplo

```bash
pnpm db:seed
```

Isso vai criar:
- 3 grants de exemplo (FINEP, FAPESP, EMBRAPII)
- 1 usuário admin (admin@grantbr.com)

### 5. Iniciar Aplicação

```bash
pnpm dev
```

Acesse: **http://localhost:3000** 🎉

## 📋 Comandos Principais

```bash
# Desenvolvimento
pnpm dev                  # Inicia todos os apps
pnpm web:dev              # Apenas frontend
pnpm build                # Build de produção

# Database
pnpm db:studio            # Abrir Prisma Studio (UI do banco)
pnpm db:push              # Aplicar mudanças no schema
pnpm db:seed              # Popular com dados de exemplo

# Code Quality
pnpm lint                 # Rodar linter
pnpm format               # Formatar código
pnpm type-check           # Verificar tipos TypeScript

# Limpeza
pnpm clean                # Limpar builds e node_modules
```

## 🗂️ Estrutura Principal

```
grantbr/
├── apps/
│   └── web/              ← Frontend Next.js (localhost:3000)
├── packages/
│   ├── database/         ← Prisma + PostgreSQL
│   ├── ui/               ← Componentes UI
│   └── ...
├── SETUP.md              ← Guia completo de instalação
├── NEXT_STEPS.md         ← O que fazer depois
└── ARCHITECTURE.md       ← Arquitetura detalhada
```

## 🎯 Primeiras Tarefas

Após rodar `pnpm dev`:

### 1. Explorar Frontend (5 min)

✅ Acesse http://localhost:3000
✅ Veja landing page profissional
✅ Teste navegação (algumas rotas ainda não existem)

### 2. Explorar Database (5 min)

```bash
pnpm db:studio
```

✅ Abre em http://localhost:5555
✅ Veja os 3 grants de exemplo
✅ Explore o schema completo

### 3. Modificar Landing Page (10 min)

**Arquivo**: `apps/web/src/app/page.tsx`

Tente:
- Mudar título
- Adicionar nova feature card
- Alterar cores (via Tailwind)

Salve e veja hot reload! ⚡

## 🔧 Configuração Opcional

### OpenAI (para IA)

```bash
# Em apps/web/.env.local
OPENAI_API_KEY="sk-..."
```

Obtenha em: https://platform.openai.com/api-keys

### Redis (para filas)

```bash
# macOS
brew install redis
brew services start redis

# Verificar
redis-cli ping  # Deve retornar: PONG
```

### NextAuth (autenticação)

```bash
# Gerar secret
openssl rand -base64 32

# Em apps/web/.env.local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<secret-gerado>"
```

## 📚 Próximos Passos

Depois de rodar o projeto, veja:

1. **NEXT_STEPS.md** → Roadmap de 12 semanas
2. **ARCHITECTURE.md** → Como tudo funciona
3. **PROJECT_STRUCTURE.md** → Mapa do código

## 🐛 Problemas Comuns

### "Cannot find module @prisma/client"

```bash
pnpm db:generate
```

### "Port 3000 already in use"

```bash
PORT=3001 pnpm dev
```

### "Database connection failed"

1. PostgreSQL está rodando?
   ```bash
   pg_isready
   ```

2. Credenciais corretas em `.env`?
   ```bash
   cat packages/database/.env
   ```

3. Banco existe?
   ```bash
   psql -l | grep grantbr
   ```

### Hot Reload não funciona

```bash
rm -rf apps/web/.next
pnpm dev
```

## ✅ Checklist de Setup

- [ ] PostgreSQL configurado e rodando
- [ ] `pnpm install` executado com sucesso
- [ ] `pnpm db:push` sem erros
- [ ] `pnpm dev` rodando sem erros
- [ ] http://localhost:3000 acessível
- [ ] Landing page carregando corretamente
- [ ] (Opcional) `pnpm db:studio` abrindo
- [ ] (Opcional) Redis rodando

## 🎓 Recursos

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

## 🆘 Ajuda

Se algo não funcionar:

1. Verifique `SETUP.md` para troubleshooting detalhado
2. Leia mensagens de erro com atenção
3. Google + ChatGPT são seus amigos 😄

---

**Pronto para codar! Boa sorte! 🚀🇧🇷**
