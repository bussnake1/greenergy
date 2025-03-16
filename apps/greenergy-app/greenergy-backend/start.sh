#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🌱 Seeding the database..."
npx nx run greenergy-backend:seed

echo "🚀 Starting NestJS application..."
exec node dist/main.js
