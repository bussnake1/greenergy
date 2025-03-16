#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🌱 Seeding the database..."
node dist/scripts/run-seeder.js

echo "🚀 Starting NestJS application..."
exec node dist/main.js
