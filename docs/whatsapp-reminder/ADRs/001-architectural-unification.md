# ADR 001: Project-Wide Architectural Unification

## Status
Accepted

## Context
The project was previously inconsistent across its modules (Auth, WhatsApp, Reminders, Infra). Each module handled database access, API responses, and error handling differently. This led to increased complexity, fragile code, and a lack of predictable behavior for the frontend.

## Decision
We enforce a strict architectural standard across the entire monorepo:

1.  **Repository Pattern**: Every module must use a Repository class extending `BaseRepository` for all data access. Controllers and Services are forbidden from calling `PrismaClient` directly.
2.  **Unified API Response Shape**: All successful non-error responses are automatically wrapped in a `{ "success": true, "data": ... }` shape via a global `onSend` hook in Fastify.
3.  **Global Error Handling**: Standardized on the `AppError` pattern. Controllers throw specific error subclasses (e.g., `BadRequestError`), which are caught and formatted into a unified JSON structure by a global `setErrorHandler`.
4.  **Resilience Layer (Circuit Breakers)**: All external API calls (Meta, Google) and Redis/DB-heavy operations must be wrapped in a **Circuit Breaker (`opossum`)** to prevent cascading failures.
5.  **Background Task Offloading (BullMQ)**: Non-blocking tasks (WhatsApp sending, Calendar syncing, Reminders) must be processed via **BullMQ** workers to keep the API Gateway responsive.
6.  **Centralized Dependency Injection**: All services, repositories, and controllers are managed via a central `Container` to ensure singleton lifecycles and easier mocking during testing.
7.  **Shared Monorepo Packages**: Cross-cutting concerns (Database, Logger, Types, Env) are centralized in the `/packages` directory as the single source of truth for all apps.

## Consequences
- **Positive**: High resilience (system stays up if Meta is down), predictable API behavior, and extreme scalability through worker horizontal scaling.
- **Negative**: Requires more boilerplate for initial module setup; developers must be familiar with the BullMQ worker/api split.
