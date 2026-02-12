FROM node:24.11.1-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY back/package.json ./back/

RUN pnpm install --frozen-lockfile

COPY back ./back

WORKDIR /app/back

RUN pnpm db:generate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

# Production stage
FROM node:24.11.1-alpine

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY back/package.json ./back/

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/back/node_modules ./back/node_modules
COPY --from=base /app/back/.next ./back/.next

# Copy source files needed for production
COPY back/server.ts ./back/
COPY back/src ./back/src
COPY back/prisma ./back/prisma
COPY back/prisma.ts ./back/
COPY back/prisma.config.ts ./back/
COPY back/next.config.ts ./back/
COPY back/tsconfig.json ./back/

WORKDIR /app/back

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME_BACKEND="0.0.0.0"
ENV PORT_BACKEND=4500

EXPOSE 4500

CMD ["pnpm", "start"]