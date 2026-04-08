# Stage 1: Prune and preparation
FROM node:20-alpine3.20 AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@ingetin/whatsapp-reminder-app --scope=@ingetin/whatsapp-reminder-website --docker

# Stage 2: Build dependencies
FROM node:20-alpine3.20 AS builder
WORKDIR /usr/src/app

# Copy pruned locks and package configs
COPY --from=pruner /usr/src/app/out/json/ .
COPY --from=pruner /usr/src/app/out/package-lock.json ./package-lock.json
RUN npm install

# Copy pruned source and root configs
COPY --from=pruner /usr/src/app/out/full/ .
COPY turbo.json .
COPY tsconfig.base.json .

# Build only the required apps and their dependencies
RUN npx turbo run build --filter=@ingetin/whatsapp-reminder-app... --filter=@ingetin/whatsapp-reminder-website...

# Stage 3: Production runner
FROM node:20-alpine3.20 AS runner
RUN apk add --no-cache openssl libc6-compat curl
WORKDIR /usr/src/app

# Set non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp
USER nodeapp

# Copy production artifacts
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/packages/ ./packages/
COPY --from=builder /usr/src/app/apps/whatsapp-reminder/whatsapp-reminder-app/ ./apps/whatsapp-reminder/whatsapp-reminder-app/

# CRITICAL FIX: Copy the compiled frontend website into the backend's public folder
COPY --from=builder /usr/src/app/apps/whatsapp-reminder/whatsapp-reminder-website/dist/ ./apps/whatsapp-reminder/whatsapp-reminder-app/public/

# Environment setup
ENV NODE_ENV=production
ENV SERVICE_TYPE=ALL

WORKDIR /usr/src/app/apps/whatsapp-reminder/whatsapp-reminder-app

# Expose port
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Launch the app
CMD ["npm", "start"]
