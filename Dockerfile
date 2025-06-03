# 1. Base Image: Use an official Node.js LTS version on Alpine Linux for a smaller image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# ------------------------------------
# 2. Dependencies Stage
FROM base AS deps

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# ------------------------------------
# 3. Builder Stage
FROM base AS builder
WORKDIR /app

# Accept build-time environment variables
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_PASSWORD
ARG REDIS_URL
ARG MONGODB_URI
ARG MONGODB_DB_NAME
ARG JWT_SECRET

# Expose them as ENV variables for the build process
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=$REDIS_PORT
ENV REDIS_PASSWORD=$REDIS_PASSWORD
ENV REDIS_URL=$REDIS_URL
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB_NAME=$MONGODB_DB_NAME
ENV JWT_SECRET=$JWT_SECRET

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV production

# Build the Next.js application
RUN npm run build

# ------------------------------------
# 4. Runner Stage: This is the final image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Next.js default port is 3000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]