FROM node:24.11.1-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY back/package.json ./back/
COPY shared/package.json ./shared/
COPY shared/src ./shared/src

RUN pnpm install --frozen-lockfile

COPY back ./back

WORKDIR /app

RUN pnpm --filter @ls-app/shared run build

WORKDIR /app/back

RUN pnpm db:generate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Production stage
FROM node:24.11.1-alpine

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY back/package.json ./back/
COPY shared/package.json ./shared/
COPY --from=base /app/shared/dist ./shared/dist

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/shared/node_modules ./shared/node_modules
COPY --from=base /app/back/node_modules ./back/node_modules
COPY --from=base /app/back/.next ./back/.next

# Copy source files needed for production
COPY back/server.ts ./back/
COPY back/src ./back/src
COPY back/prisma ./back/prisma
COPY --from=base /app/back/prisma/generated ./back/prisma/generated
COPY back/prisma.config.ts ./back/
COPY back/next.config.ts ./back/
COPY back/tsconfig.json ./back/

WORKDIR /app/back

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME_BACKEND="0.0.0.0"
ENV PORT_BACKEND=4500

EXPOSE 4500

# Copie du script de démarrage Prisma + serveur
COPY back/start.sh ./back/
RUN chmod +x ./back/start.sh

CMD ["sh", "./back/start.sh"]