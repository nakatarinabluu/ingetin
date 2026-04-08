import { createClient } from 'redis';
import { logger } from '@ingetin/logger';

// Create a single shared Redis client across the monorepo
export const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
});

redis.on('error', (err) => logger.error({ msg: 'Redis Client Error', error: err.message, stack: err.stack }));
redis.on('connect', () => logger.info('Redis Client Connected (Shared Custom Cache)'));

// Explicit connect function — call this in main() startup, not on import
export async function connectRedis(): Promise<void> {
    try {
        await redis.connect();
    } catch (e: any) {
        logger.error({ msg: 'Failed to connect to Redis', error: e.message, stack: e.stack });
        throw e; // Re-throw so the caller can handle gracefully
    }
}
