#!/bin/bash
set -e

echo "🚀 Starting Ingetin Master Deployment..."

# 1. Check for .env file
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "⚠️ .env not found, creating from .env.example..."
        cp .env.example .env
        echo "❌ ACTION REQUIRED: Please edit your .env file with real credentials and run this script again!"
        exit 1
    else
        echo "❌ Error: .env.example not found!"
        exit 1
    fi
fi

# 2. Install Dependencies (Standard Monorepo)
echo "📦 Installing project dependencies..."
npm install

# 3. Generate Prisma Client (Safe Step)
echo "💎 Generating Prisma Client..."
npx turbo run generate

# 4. Push Database Schema (Ensures DB is ready)
# Note: In production, you'd usually use 'prisma migrate deploy'
# but since you wanted a fresh start, 'db push' is fine for now.
echo "🗄️ Syncing Database Schema..."
npx turbo run db:push

# 5. Build & Start Docker Containers
echo "🐳 Building and starting Docker containers..."
docker compose up -d --build

# 6. Wait for DB Health
echo "⏳ Waiting for Database to be healthy..."
until docker exec ingetin-db pg_isready -U postgres > /dev/null 2>&1; do
  echo "Still waiting for postgres..."
  sleep 2
done

echo "✅ ALL SYSTEMS GO! Your app is running at http://localhost:4000 (or your configured domain)"
echo "--------------------------------------------------------"
echo "📊 Monitoring Command: docker compose logs -f app"
echo "🛠️ Optimization Tip: Run ./deploy/scripts/optimize-vps.sh if RAM is tight."
echo "--------------------------------------------------------"
