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

ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

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

# Copy standalone output (this contains the node_modules and the server.js)
COPY --from=base /app/front/.next/standalone ./

# IMPORTANT: Static and public files must be in the root for standalone to find them
COPY --from=base /app/front/.next/static ./.next/static
COPY --from=base /app/front/public ./public

EXPOSE 3001

# The standalone output generates a server.js file in front/server.js
CMD ["node", "front/server.js"]