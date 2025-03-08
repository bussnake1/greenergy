# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Copy the entire monorepo
COPY apps/greenergy-app/greenergy-frontend ./apps/greenergy-app/greenergy-frontend
COPY libs ./libs

# Install dependencies
RUN npm ci

# Sync NX workspace to ensure TypeScript project references are correct
RUN npx nx sync

# Set environment variables for NX build
ENV NX_DAEMON=false
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npx nx build greenergy-frontend --prod

# Debug: List the build output to see the structure
RUN ls -la /app/dist/apps/greenergy-app/greenergy-frontend

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

# Copy the built application - Nuxt 3 output is in the .output directory
COPY --from=builder /app/dist/apps/greenergy-app/greenergy-frontend/.output ./

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Run the application
CMD ["node", "server/index.mjs"]
