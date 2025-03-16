#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🌱 Seeding the database..."
npx ts-node -r tsconfig-paths/register apps/greenergy-app/greenergy-backend/src/scripts/run-seeder.ts

echo "🚀 Starting NestJS application..."
exec node dist/main.js
