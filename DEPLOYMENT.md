# 🚀 Guia de Deploy - GrantBR

## Estratégias de Deploy

### 1. Deploy Rápido (Vercel + Supabase)

**Tempo**: 20 minutos
**Custo**: $0-25/mês
**Ideal para**: MVP, testes, demos

#### Passo 1: Deploy Frontend (Vercel)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy Next.js
cd apps/web
vercel

# 3. Seguir prompts:
# - Link to project? No
# - Project name: grantbr-web
# - Directory: ./
# - Build command: (auto-detected)
# - Output directory: (auto-detected)

# 4. Configurar variáveis de ambiente
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY

# 5. Deploy produção
vercel --prod
```

#### Passo 2: Database (Supabase)

```bash
# 1. Criar conta em https://supabase.com

# 2. Criar novo projeto
# - Nome: grantbr
# - Password: (strong password)
# - Region: South America (São Paulo)

# 3. Copiar Connection String
# Settings > Database > Connection string > URI

# 4. Atualizar schema
# SQL Editor > Run:
# (copiar schema do Prisma convertido)

# 5. Copiar DATABASE_URL e adicionar no Vercel
```

#### Passo 3: Backend API (Railway)

```bash
# 1. Criar conta em https://railway.app

# 2. New Project > Deploy from GitHub repo

# 3. Selecionar apps/api

# 4. Configurar variáveis:
DATABASE_URL=<supabase-url>
REDIS_URL=<railway-redis-url>
OPENAI_API_KEY=<sua-key>
PORT=4000

# 5. Deploy automático!
```

---

### 2. Deploy Production (AWS)

**Tempo**: 2-3 horas
**Custo**: $50-200/mês
**Ideal para**: Produção, escala

#### Arquitetura

```
┌─────────────┐
│ CloudFront  │ ← CDN (frontend)
└──────┬──────┘
       │
┌──────▼──────┐
│     S3      │ ← Static files (Next.js)
└─────────────┘

┌─────────────┐
│   Route53   │ ← DNS
└──────┬──────┘
       │
┌──────▼──────┐
│     ALB     │ ← Load Balancer
└──────┬──────┘
       │
┌──────▼──────┐
│     ECS     │ ← Containers (API)
│   Fargate   │
└──────┬──────┘
       │
┌──────▼──────┐     ┌──────────┐
│     RDS     │     │  Redis   │
│ PostgreSQL  │     │ ElastiCache
└─────────────┘     └──────────┘
```

#### Setup AWS

```bash
# 1. Instalar AWS CLI
brew install awscli

# 2. Configurar credenciais
aws configure

# 3. Criar infraestrutura (Terraform)
cd infrastructure/
terraform init
terraform plan
terraform apply

# 4. Build e push Docker images
docker build -t grantbr-api apps/api
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker tag grantbr-api:latest <ecr-url>/grantbr-api:latest
docker push <ecr-url>/grantbr-api:latest

# 5. Deploy via ECS
aws ecs update-service --cluster grantbr --service api --force-new-deployment

# 6. Deploy frontend
cd apps/web
npm run build
aws s3 sync out/ s3://grantbr-frontend
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

---

### 3. Deploy com Docker Compose

**Tempo**: 30 minutos
**Custo**: Custo do servidor ($10-50/mês)
**Ideal para**: Self-hosted, controle total

#### docker-compose.yml Completo

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: grantbr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/grantbr
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      NODE_ENV: production
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/grantbr
      NEXT_PUBLIC_API_URL: http://api:4000
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Deploy

```bash
# 1. Criar .env
cat > .env <<EOF
DB_PASSWORD=strong-password
OPENAI_API_KEY=sk-...
NEXTAUTH_URL=https://grantbr.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF

# 2. Build e start
docker-compose up -d --build

# 3. Run migrations
docker-compose exec api pnpm db:push

# 4. Verificar
docker-compose ps
curl http://localhost:3000
```

---

## Monitoramento

### Sentry (Error Tracking)

```bash
# 1. Criar conta em sentry.io

# 2. Adicionar no Next.js
npm install --save @sentry/nextjs
npx @sentry/wizard -i nextjs

# 3. Adicionar no Node.js
npm install --save @sentry/node
```

```typescript
// apps/api/src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### Logging (Winston)

```typescript
// apps/api/src/lib/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### Health Checks

```typescript
// apps/api/src/routes/health.ts
app.get("/health", async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: "ok",
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      openai: await checkOpenAI(),
    },
  };

  const isHealthy = Object.values(health.checks).every(c => c === "ok");

  res.status(isHealthy ? 200 : 503).json(health);
});
```

---

## SSL/HTTPS

### Let's Encrypt (Gratuito)

```bash
# 1. Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 2. Obter certificado
sudo certbot --nginx -d grantbr.com -d www.grantbr.com

# 3. Auto-renewal
sudo certbot renew --dry-run
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name grantbr.com www.grantbr.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name grantbr.com www.grantbr.com;

    ssl_certificate /etc/letsencrypt/live/grantbr.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grantbr.com/privkey.pem;

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Backup e Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# PostgreSQL backup
docker-compose exec -T postgres pg_dump -U postgres grantbr > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://grantbr-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# CRON: 0 2 * * * /path/to/backup.sh
```

### Recovery

```bash
# Restore from backup
gunzip db_20250115.sql.gz
docker-compose exec -T postgres psql -U postgres grantbr < db_20250115.sql
```

---

## CI/CD com GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions@v1
        with:
          args: "deploy apps/api"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

**Deploy completo! 🎉**

Seu sistema está pronto para produção!
