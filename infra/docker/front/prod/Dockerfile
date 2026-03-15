FROM node:24.11.1-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY front/package.json ./front/
COPY shared/package.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src

RUN pnpm install --frozen-lockfile

COPY front ./front

WORKDIR /app

RUN pnpm --filter @ls-app/shared run build

WORKDIR /app/front

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Production stage
FROM node:24.11.1-alpine

RUN corepack enable pnpm

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3001

# Copy standalone output
COPY --from=base /app/front/.next/standalone ./

# IMPORTANT: Copy assets to both root and app folder for maximum compatibility in standalone monorepo
COPY --from=base /app/front/.next/static ./front/.next/static
COPY --from=base /app/front/public ./front/public
COPY --from=base /app/front/.next/static ./.next/static
COPY --from=base /app/front/public ./public

EXPOSE 3001

# Run the server from the app folder
CMD ["node", "front/server.js"]