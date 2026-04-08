# 🛠️ Ingetin WhatsApp: Maintenance & Scaling Guide

This document outlines the architecture, standards, and expansion strategies for the Ingetin WhatsApp Ecosystem.

## 🏗️ Architecture Standard: BullMQ + Prisma
We use a **Distributed Task Architecture** to ensure the system remains reliable under load.

- **Fastify API**: Handles high-performance HTTP I/O (Webhooks, User Actions).
- **BullMQ Workers**: Handles all "Heavy" background work (Messages, Sync). 
- **Prisma**: Type-safe database management.
- **Circuit Breakers (`opossum`)**: Protects the system from external API outages (Meta/Google).

## 🚀 Scaling Strategies
### 1. Reliable Background Processing
- The system uses **BullMQ** (Redis-backed) to avoid process-blocking tasks.
- **Scaling**: If queue latency exceeds 60s, you can simply spin up more `ingetin-apps-whatsapp-reminder-worker` containers on any server that has access to your Redis.

### 2. Database Scaling
- **Strategy**: Implement PostgreSQL Table Partitioning by `createdAt` for the `messages` and `usage_logs` tables when reaching >1M records.

### 3. High Availability
- **CORS**: Strict allowed origins list.
- **Monitoring**: Always monitor the `/api/health` endpoint. It provides real-time "Resilience Checks" for your Redis, Postgres, and Third-party providers.

## 🧹 Maintenance & "Self-Healing"
- **Recurring Event Pruning**: The system automatically cleans up "recurring event bloat" during calendar syncs to prevent database slowdown.
- **Prisma**: Always run `npx prisma generate` after schema changes to update the shared database client.
- **Redis Hygiene**: Periodically monitor Redis memory usage (`INFO memory`) to ensure the BullMQ state doesn't bloat.

---
*Maintained for Ingetin Enterprise*
