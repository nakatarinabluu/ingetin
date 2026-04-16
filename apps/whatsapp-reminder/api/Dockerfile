# Stage 1: Prune and preparation
FROM node:20-alpine3.20 AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@ingetin/api --scope=@ingetin/web --docker

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

# Build API and Web
RUN npx turbo run build --filter=@ingetin/api... --filter=@ingetin/web...

# Stage 3: Production runner
FROM node:20-alpine3.20 AS runner
RUN apk add --no-cache openssl libc6-compat curl
WORKDIR /usr/src/app

# Global install pm2 for runtime management
RUN npm install -g pm2

# Copy production artifacts
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/packages/ ./packages/
COPY --from=builder /usr/src/app/apps/whatsapp-reminder/api/ ./apps/whatsapp-reminder/api/

# Copy the compiled frontend website into the backend's public folder
COPY --from=builder /usr/src/app/apps/whatsapp-reminder/web/dist/ ./apps/whatsapp-reminder/api/public/

# Environment setup
ENV NODE_ENV=production

WORKDIR /usr/src/app/apps/whatsapp-reminder/api

# Expose API port
EXPOSE 4000

# Healthcheck (Checks the API process)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Launch the unified ecosystem (API + Worker)
CMD ["npm", "run", "start:prod"]
