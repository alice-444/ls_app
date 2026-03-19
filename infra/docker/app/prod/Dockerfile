FROM node:24.11.1-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

# Copy pnpm configuration and workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy packages package.json
COPY app/package.json ./app/
COPY shared/package.json ./shared/

# Copy shared source for build
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src

# Install all dependencies (including shared build)
RUN pnpm install --frozen-lockfile

# Copy app source code
COPY app ./app

WORKDIR /app

# Build shared package
RUN pnpm --filter @ls-app/shared run build

# Generate Prisma Client (crucial for merged app)
WORKDIR /app/app
RUN pnpm db:generate

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Production stage
FROM node:24.11.1-alpine

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/package.json ./app/
COPY shared/package.json ./shared/

# Copy built shared package and all node_modules (backend approach)
COPY --from=base /app/shared/dist ./shared/dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/shared/node_modules ./shared/node_modules
COPY --from=base /app/app/node_modules ./app/node_modules
COPY --from=base /app/app/.next ./app/.next

# Copy source files needed for production custom server
COPY app/server.ts ./app/
COPY app/src ./app/src
COPY app/prisma ./app/prisma
COPY --from=base /app/app/prisma/generated ./app/prisma/generated
COPY app/prisma.config.ts ./app/
COPY app/next.config.ts ./app/
COPY app/tsconfig.json ./app/
COPY app/public ./app/public
COPY app/start.sh ./app/

WORKDIR /app/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3001

EXPOSE 3001

# Script de démarrage Prisma + serveur custom
RUN chmod +x ./start.sh

CMD ["sh", "./start.sh"]
