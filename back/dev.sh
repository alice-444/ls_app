#!/bin/sh

echo "✅
 Configuring pnpm..."
pnpm config set allow-scripts true

echo "📦
 Installing dependencies..."
pnpm install

echo "🔁
 Running Prisma generate..."
pnpm exec prisma generate

echo "🔄
 Running Prisma migrate"
pnpm exec prisma migrate deploy || true

echo "🚀
 Start API Learnsup 🙃
"
pnpm dev:next