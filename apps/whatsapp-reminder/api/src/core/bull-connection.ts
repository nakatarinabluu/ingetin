import IORedis from 'ioredis';
import { env } from './config';
import { logger } from '@ingetin/logger';

/**
 * Shared ioredis connection for all BullMQ Queues and Workers.
 *
 * WHY: BullMQ's `connection` option accepts an ioredis ConnectionOptions object
 * (host/port), NOT `{ url: string }`. The correct approach per BullMQ docs is
 * to create a single IORedis instance and reuse it across all queue instances.
 *
 * WHY `maxRetriesPerRequest: null`:
 * BullMQ workers use blocking Redis commands (BLMOVE, XREAD, etc.).
 * ioredis by default limits retries per request, which causes workers to throw
 * "Command timed out" errors in production under load. Setting it to `null`
 * disables the limit, which is REQUIRED for BullMQ workers per the official docs.
 *
 * @see https://docs.bullmq.io/guide/connections
 */
export const bullConnection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ blocking commands
    enableReadyCheck: false,    // Recommended by BullMQ to avoid startup race
    lazyConnect: false,
});

bullConnection.on('error', (err) => {
    // Log but don't crash — BullMQ handles reconnection internally
    logger.error({ msg: '[BullMQ Redis] Connection error', error: err.message });
});
