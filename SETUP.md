# 🚀 Setup Guide - GrantBR

Guia completo para configurar o ambiente de desenvolvimento da plataforma GrantBR.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recomendado) ou npm/yarn
- **PostgreSQL** >= 14
- **Redis** >= 6.0 (para filas de jobs)
- **Git**

## 🔧 Instalação Local

### 1. Clone o repositório (se aplicável)

```bash
# Se estiver usando git
git clone <repository-url>
cd grantbr
```

### 2. Instale as dependências

```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install

# Ou usando yarn
yarn install
```

### 3. Configure as variáveis de ambiente

Copie os arquivos de exemplo e preencha com suas credenciais:

```bash
# Database package
cp packages/database/.env.example packages/database/.env

# Web app
cp apps/web/.env.example apps/web/.env.local
```

### 4. Configure o banco de dados PostgreSQL

Crie um banco de dados PostgreSQL:

```bash
# Via psql
createdb grantbr

# Ou via SQL
psql -U postgres
CREATE DATABASE grantbr;
```

Atualize a `DATABASE_URL` no arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grantbr?schema=public"
```

### 5. Execute as migrations do Prisma

```bash
# Gerar o Prisma Client
pnpm --filter @grantbr/database db:generate

# Executar migrations
pnpm --filter @grantbr/database db:push

# (Opcional) Seed inicial com dados de exemplo
pnpm --filter @grantbr/database db:seed
```

### 6. Configure Redis (para filas)

```bash
# Instalação no macOS
brew install redis
brew services start redis

# Instalação no Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Verifique se está rodando
redis-cli ping
# Deve retornar: PONG
```

### 7. (Opcional) Configure serviços externos

#### OpenAI API

1. Crie uma conta em https://platform.openai.com
2. Gere uma API key
3. Adicione no `.env.local`:

```env
OPENAI_API_KEY="sk-..."
```

#### Pinecone (Vector Database)

1. Crie uma conta em https://www.pinecone.io
2. Crie um index (dimensão: 1536 para OpenAI embeddings)
3. Adicione as credenciais:

```env
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="..."
PINECONE_INDEX="grantbr"
```

#### NextAuth (Autenticação)

Gere um secret para o NextAuth:

```bash
openssl rand -base64 32
```

Adicione no `.env.local`:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<secret-gerado>"
```

## 🏃‍♂️ Executar em Desenvolvimento

### Iniciar todos os serviços

```bash
pnpm dev
```

Isso iniciará:
- **Frontend (web)**: http://localhost:3000
- **Backend (api)**: http://localhost:4000 (quando implementado)

### Iniciar serviços individuais

```bash
# Apenas frontend
pnpm --filter @grantbr/web dev

# Apenas backend (quando criado)
pnpm --filter @grantbr/api dev
```

## 🛠️ Scripts Úteis

```bash
# Build de produção
pnpm build

# Lint de todo o código
pnpm lint

# Formatar código
pnpm format

# Type check
pnpm type-check

# Limpar builds e node_modules
pnpm clean

# Prisma Studio (UI para o banco)
pnpm --filter @grantbr/database db:studio
```

## 📦 Estrutura do Projeto

```
grantbr/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend Node.js (a implementar)
├── packages/
│   ├── database/     # Prisma + models
│   ├── ui/           # Componentes UI compartilhados
│   ├── typescript-config/
│   └── eslint-config/
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## 🐛 Troubleshooting

### Erro: "Cannot find module @prisma/client"

```bash
pnpm --filter @grantbr/database db:generate
```

### Erro: Porta 3000 já está em uso

```bash
# Mudar porta no dev
PORT=3001 pnpm dev
```

### Erro: Conexão com PostgreSQL falhou

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais na `DATABASE_URL`
3. Teste a conexão:

```bash
psql -U postgres -h localhost -d grantbr
```

### Erro: Redis connection failed

```bash
# Verificar se Redis está ativo
redis-cli ping

# Reiniciar Redis
brew services restart redis  # macOS
sudo systemctl restart redis # Linux
```

## 🚀 Deploy

### Vercel (Frontend)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático em cada push

### Railway/Fly.io (Backend + Database)

Documentação a ser adicionada quando o backend estiver implementado.

## 📚 Próximos Passos

Após setup completo:

1. ✅ Explore o frontend em http://localhost:3000
2. ✅ Acesse Prisma Studio: `pnpm --filter @grantbr/database db:studio`
3. ⏭️ Implemente o primeiro scraper (FINEP)
4. ⏭️ Configure integração OpenAI
5. ⏭️ Build matching algorithm

## 🆘 Suporte

Para dúvidas ou problemas:
- Verifique a documentação em `/docs`
- Abra uma issue no GitHub
- Entre em contato com a equipe

---

**Happy coding! 🇧🇷**
