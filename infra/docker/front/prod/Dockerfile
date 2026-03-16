FROM node:24.11.1-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

# Copy pnpm configuration and workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy packages package.json
COPY front/package.json ./front/
COPY shared/package.json ./shared/

# Copy shared source for build
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src

# Install all dependencies (including shared build)
RUN pnpm install --frozen-lockfile

# Copy front source code
COPY front ./front

WORKDIR /app

# Build shared package
RUN pnpm --filter @ls-app/shared run build

# Generate Prisma Client (crucial for merged app)
WORKDIR /app/front
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
COPY front/package.json ./front/
COPY shared/package.json ./shared/

# Copy built shared package and all node_modules (backend approach)
COPY --from=base /app/shared/dist ./shared/dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/shared/node_modules ./shared/node_modules
COPY --from=base /app/front/node_modules ./front/node_modules
COPY --from=base /app/front/.next ./front/.next

# Copy source files needed for production custom server
COPY front/server.ts ./front/
COPY front/src ./front/src
COPY front/prisma ./front/prisma
COPY --from=base /app/front/prisma/generated ./front/prisma/generated
COPY front/prisma.config.ts ./front/
COPY front/next.config.ts ./front/
COPY front/tsconfig.json ./front/
COPY front/public ./front/public
COPY front/start.sh ./front/

WORKDIR /app/front

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3001

EXPOSE 3001

# Script de démarrage Prisma + serveur custom
RUN chmod +x ./start.sh

CMD ["sh", "./start.sh"]
