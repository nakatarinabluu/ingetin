import Redis from 'ioredis';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';

export class RedisService {
    private client: Redis;

    constructor() {
        this.client = new Redis(env.REDIS_URL);
        
        this.client.on('connect', () => logger.info('Connected to Redis (WhatsApp Storage)'));
        this.client.on('error', (err) => logger.error({ msg: 'Redis Error', error: err }));
    }

    /**
     * Get the internal Redis client (used for rate-limiting, queues, etc.)
     */
    public get instance(): Redis {
        return this.client;
    }

    async setOTP(phone: string, code: string, ttl: number = 300): Promise<void> {
        await this.client.set(`otp:${phone}`, code, 'EX', ttl);
    }

    async getOTP(phone: string): Promise<string | null> {
        return await this.client.get(`otp:${phone}`);
    }

    async deleteOTP(phone: string): Promise<void> {
        await this.client.del(`otp:${phone}`);
    }

    async setCache(key: string, value: string, ttl: number = 300): Promise<void> {
        await this.client.set(`cache:${key}`, value, 'EX', ttl);
    }

    async getCache(key: string): Promise<string | null> {
        return await this.client.get(`cache:${key}`);
    }

    async deleteCache(key: string): Promise<void> {
        await this.client.del(`cache:${key}`);
    }

    // Cooling system (to prevent billing spikes)
    async setCooling(phone: string, ttl: number = 60): Promise<void> {
        await this.client.set(`cooling:${phone}`, 'true', 'EX', ttl);
    }

    async isCooling(phone: string): Promise<boolean> {
        const cooling = await this.client.get(`cooling:${phone}`);
        return !!cooling;
    }

    /**
     * Acquire a distributed lock
     * @returns true if lock acquired, false if already locked
     */
    async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
        const result = await this.client.set(`lock:${key}`, 'locked', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    /**
     * Release a distributed lock
     */
    async releaseLock(key: string): Promise<void> {
        await this.client.del(`lock:${key}`);
    }

    // Health check wrapper
    async ping(): Promise<string> {
        return await this.client.ping();
    }
}
