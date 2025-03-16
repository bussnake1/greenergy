# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Copy the entire monorepo
COPY apps/greenergy-app/greenergy-backend ./apps/greenergy-app/greenergy-backend
COPY libs ./libs

# Install dependencies
RUN npm ci

# Sync NX workspace to ensure TypeScript project references are correct
RUN npx nx sync

# Set environment variables for NX build
ENV NX_DAEMON=false
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npx nx build greenergy-backend --prod

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Install Prisma client and other dependencies needed for seeding
RUN npm install @prisma/client fast-xml-parser ts-node tsconfig-paths

# Copy Prisma schema for migrations
COPY --from=builder /app/apps/greenergy-app/greenergy-backend/prisma ./prisma

# Copy tsconfig and nx files for ts-node
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/nx.json ./
COPY --from=builder /app/apps/greenergy-app/greenergy-backend/tsconfig*.json ./apps/greenergy-app/greenergy-backend/

# Copy the built application
COPY --from=builder /app/dist/apps/greenergy-app/greenergy-backend ./dist

# Copy the entire src directory for seeding
COPY --from=builder /app/apps/greenergy-app/greenergy-backend/src ./apps/greenergy-app/greenergy-backend/src

# Copy libs directory for shared code
COPY --from=builder /app/libs ./libs

# Copy startup script
COPY --from=builder /app/apps/greenergy-app/greenergy-backend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose the port
EXPOSE 3333

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333

# Run the startup script which will run migrations and then start the application
CMD ["./start.sh"]
