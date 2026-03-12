FROM node:24.11.1-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY front/package.json ./front/

RUN pnpm install --frozen-lockfile

COPY front ./front

WORKDIR /app/front

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Production stage
FROM node:24.11.1-alpine

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY --from=base /app/front/package.json ./front/

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/front/node_modules ./front/node_modules
COPY --from=base /app/front/.next ./front/.next
COPY --from=base /app/front/public ./front/public

WORKDIR /app/front

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001

CMD ["pnpm", "start", "-p", "3001"]