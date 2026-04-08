# 🤝 Contributing to Ingetin

Welcome to the Silicon Valley of WhatsApp automation! We're glad you're here.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- NPM 10+

### Setup
1. Clone the repository
2. Run `make setup` to install dependencies and generate database clients.
3. Use `make docker-up` to start the infrastructure (Postgres, Redis).
4. Run `make dev` to start the ecosystem in development mode.

## 🛠️ Development Workflow
- **Monorepo:** We use [Turborepo](https://turbo.build/). Use `npx turbo run <task>` to run tasks across all packages.
- **Backend:** Fastify with Prisma.
- **Frontend:** React with Tailwind CSS.

## 🧪 Testing Standards
- **Unit Tests:** All new core logic must have corresponding `.spec.ts` files using Vitest.
- **Coverage:** Aim for 80% coverage.
- **E2E:** Critical flows (Auth, Reminder Creation) should be covered by Playwright.

## 🔐 Security Guidelines
- Never commit `.env` files.
- All external API calls must use the `CircuitBreaker` pattern.
- PII must be redacted in logs using the shared `@ingetin/logger`.

## 📜 Pull Request Process
1. Ensure `make lint` and `make test` pass.
2. Provide a clear description of the change.
3. Update the audit report if you address any weaknesses.
