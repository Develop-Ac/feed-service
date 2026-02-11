# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies (needed for build) & generate Prisma client
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma Client explicitly
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Install runtime dependencies (OpenSSL is required for Prisma, libc6-compat for some native addons)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["node", "dist/main"]
