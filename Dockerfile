# =========================
# Build Stage
# =========================
FROM node:20-slim AS builder

WORKDIR /app

# Instala OpenSSL para o Prisma
RUN apt-get update && apt-get install -y openssl

# Dependências
COPY package*.json ./
RUN npm ci

# Código-fonte
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build


# =========================
# Production Stage
# =========================
FROM node:20-slim AS production

WORKDIR /app

# Instala OpenSSL para o Prisma
RUN apt-get update && apt-get install -y openssl

# Dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Aplicação compilada
COPY --from=builder /app/dist ./dist

# Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Porta da aplicação
EXPOSE 3000

# Executa migrations e inicia a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]