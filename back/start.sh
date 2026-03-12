#!/bin/sh
# Appliquer les migrations Prisma au démarrage (en production uniquement)
if [ "$NODE_ENV" = "production" ]; then
  echo "[start.sh] Déploiement des migrations Prisma..."
  npx prisma migrate deploy
fi

# Démarrer le serveur Node.js
node --import tsx ./server.ts