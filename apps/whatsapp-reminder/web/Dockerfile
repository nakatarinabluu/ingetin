# Stage 1: Build the application
FROM node:20-alpine3.20 AS builder

WORKDIR /usr/src/app

# Pass build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy root configuration and dependency manifests for workspace linking
COPY package*.json ./
COPY turbo.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/env/package.json ./packages/env/
COPY packages/logger/package.json ./packages/logger/
COPY packages/types/package.json ./packages/types/
COPY apps/whatsapp-reminder/whatsapp-reminder-website/package.json ./apps/whatsapp-reminder/whatsapp-reminder-website/

# Install dependencies at the root
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install

# Copy the rest of the source code
COPY packages/ ./packages/
COPY apps/whatsapp-reminder/whatsapp-reminder-website/ ./apps/whatsapp-reminder/whatsapp-reminder-website/

# Build the web application using Turbo
RUN npx turbo run build --filter=@ingetin/whatsapp-reminder-website

# Stage 2: Serve the application with Nginx (Non-Root)
FROM nginx:alpine

# Copy custom Nginx configuration
COPY apps/whatsapp-reminder/whatsapp-reminder-website/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the builder stage
COPY --from=builder --chown=nginx:nginx /usr/src/app/apps/whatsapp-reminder/whatsapp-reminder-website/dist /usr/share/nginx/html

# Grant necessary permissions for the 'nginx' user to run as non-root
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Switch to the non-root 'nginx' user
USER nginx

# Expose port 8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
