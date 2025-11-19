# 🚀 Como Iniciar o GrantBR

Guia rápido em Português para começar a usar a plataforma.

---

## ⚡ Início Rápido (5 minutos)

### Pré-requisitos

Certifique-se de ter instalado:

- ✅ Node.js 18+ (`node --version`)
- ✅ pnpm 8+ (`pnpm --version`)
- ✅ PostgreSQL 14+ (`psql --version`)
- ✅ Redis 6+ (`redis-cli ping`)

### Passo 1: Configurar Banco de Dados

```bash
# Criar banco PostgreSQL
createdb grantbr

# Copiar arquivo de exemplo
cp packages/database/.env.example packages/database/.env

# Editar packages/database/.env
# Altere a linha DATABASE_URL:
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/grantbr?schema=public"
```

### Passo 2: Configurar Frontend

```bash
# Copiar arquivo de exemplo
cp apps/web/.env.example apps/web/.env.local

# Editar apps/web/.env.local e adicionar:
```

```env
NEXTAUTH_SECRET="cole_aqui_o_resultado_do_comando_abaixo"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/grantbr?schema=public"
OPENAI_API_KEY="sk-sua-chave-openai"

# Opcional (para login com Google):
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

Para gerar o NEXTAUTH_SECRET, rode:
```bash
openssl rand -base64 32
```

### Passo 3: Aplicar Schema ao Banco

```bash
# Gerar Prisma Client (já foi feito ✅)
pnpm db:generate

# Aplicar schema ao banco
pnpm db:push

# Popular com dados de exemplo
pnpm --filter @grantbr/database db:seed
```

### Passo 4: Iniciar Redis

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Verificar se está rodando
redis-cli ping
# Deve retornar: PONG
```

### Passo 5: Iniciar Aplicação

```bash
# Iniciar frontend Next.js
pnpm --filter web dev

# A aplicação estará disponível em:
# http://localhost:3000
```

---

## 🎯 Primeiro Uso

### 1. Criar Conta

1. Acesse http://localhost:3000
2. Clique em "Criar Conta" ou "Sign Up"
3. Cadastre-se com email/senha ou Google

### 2. Completar Onboarding

Você será redirecionado para o wizard de 8 etapas:

**Etapa 1**: Informações Básicas
- CNPJ da empresa
- Nome fantasia
- Razão social

**Etapa 2**: Detalhes da Empresa
- Setor de atuação
- Porte (MEI, ME, EPP, Grande)
- Descrição
- Cidade/Estado

**Etapa 3**: Projetos
- Adicione seus projetos atuais
- Título, descrição, orçamento, status

**Etapa 4**: Interesses
- Áreas de interesse (IA, IoT, Saúde, etc.)
- Agências preferidas (FINEP, FAPESP, etc.)
- Faixa de orçamento desejada

**Etapa 5**: Histórico
- Grants anteriores que recebeu
- Agência, ano, valor, status

**Etapa 6**: Equipe
- Tamanho do time
- Número de PhDs e Mestres
- Percentual de dedicação a P&D

**Etapa 7**: Preferências
- Configurar notificações
- Auto-matching de oportunidades
- Score mínimo para recomendações

**Etapa 8**: Revisão
- Conferir todas informações
- Finalizar cadastro

### 3. Explorar Dashboard

Após concluir o onboarding:

- **Dashboard Principal**: Visão geral de oportunidades
- **Oportunidades**: Lista de grants disponíveis
- **Minhas Candidaturas**: Suas applications
- **Configurações**: Editar perfil

### 4. Criar sua Primeira Candidatura

1. Vá em "Oportunidades"
2. Encontre um grant interessante
3. Clique em "Verificar Elegibilidade"
4. Se elegível, clique "Ver Detalhes"
5. Clique "Create Application"
6. No editor, clique "Generate with AI"
7. Aguarde ~30 segundos
8. Revise as 8 seções geradas:
   - Executive Summary
   - Problem Statement
   - Proposed Solution
   - Methodology
   - Timeline
   - Budget
   - Team Qualifications
   - Expected Impact
9. Edite conforme necessário
10. Submeta!

---

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Iniciar frontend
pnpm --filter web dev

# Iniciar backend API (quando tiver start script)
cd apps/api && pnpm dev

# Iniciar tudo (quando configurado)
pnpm dev
```

### Database

```bash
# Ver banco de dados visualmente
pnpm db:studio
# Acesse: http://localhost:5555

# Atualizar schema
pnpm db:push

# Criar migration
pnpm db:migrate

# Popular dados
pnpm --filter @grantbr/database db:seed
```

### Build e Deploy

```bash
# Build de produção
pnpm build

# Lint código
pnpm lint

# Formatar código
pnpm format

# Type check
pnpm type-check
```

---

## 🔍 Verificar Instalação

### Checar se tudo está funcionando:

```bash
# 1. Node e pnpm
node --version  # >= 18
pnpm --version  # >= 8

# 2. PostgreSQL
psql -U postgres -d grantbr -c "SELECT version();"

# 3. Redis
redis-cli ping  # deve retornar PONG

# 4. Prisma Client gerado
ls -la node_modules/.pnpm/@prisma+client*/

# 5. Frontend rodando
curl http://localhost:3000

# 6. Database acessível
pnpm db:studio  # deve abrir em localhost:5555
```

---

## ❓ Problemas Comuns

### Erro: "Cannot find module @prisma/client"

**Solução:**
```bash
pnpm db:generate
```

### Erro: "OpenAI API key invalid"

**Solução:**
1. Obtenha uma chave em https://platform.openai.com/api-keys
2. Adicione em `apps/web/.env.local`:
```env
OPENAI_API_KEY="sk-sua-chave-aqui"
```

### Erro: "Redis connection failed"

**Solução:**
```bash
# Verificar se Redis está rodando
redis-cli ping

# Se não estiver, inicie:
brew services start redis  # macOS
sudo systemctl start redis # Linux
```

### Erro: "Database connection failed"

**Solução:**
```bash
# Verificar PostgreSQL
pg_isready

# Testar conexão
psql -U postgres -d grantbr

# Verificar DATABASE_URL
cat packages/database/.env
cat apps/web/.env.local
```

### Erro de Build no Next.js

**Solução:**
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

## 📚 Documentação Completa

Para mais informações, consulte:

- **README.md** - Visão geral do projeto
- **QUICKSTART.md** - Guia rápido em inglês
- **COMPLETE_GUIDE.md** - Guia técnico completo
- **SETUP.md** - Setup detalhado
- **DEPLOYMENT.md** - Guias de deploy
- **PROJECT_COMPLETO.md** - Status completo do projeto

---

## 🎉 Pronto para Usar!

Agora você tem:

- ✅ Plataforma completa rodando localmente
- ✅ Banco de dados configurado
- ✅ Redis funcionando
- ✅ Frontend Next.js no ar
- ✅ 9 Agentes de IA prontos
- ✅ Dados de exemplo carregados

### Próximos Passos:

1. Crie sua conta
2. Complete o onboarding
3. Explore oportunidades de grants
4. Gere sua primeira proposta com IA!

**Dúvidas?** Consulte o COMPLETE_GUIDE.md ou abra uma issue.

---

**Desenvolvido com ❤️ para o ecossistema brasileiro de inovação**
