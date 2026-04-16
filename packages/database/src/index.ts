/**
 * @ingetin/database
 *
 * This package re-exports Prisma types for use across the monorepo.
 * The actual PrismaClient singleton lives in:
 *   apps/whatsapp-reminder/whatsapp-reminder-app/src/modules/infra/prisma.service.ts
 *
 * Do NOT create a new PrismaClient here — there should be exactly one
 * client instance per process to avoid connection pool exhaustion.
 */
export * from '@prisma/client';
