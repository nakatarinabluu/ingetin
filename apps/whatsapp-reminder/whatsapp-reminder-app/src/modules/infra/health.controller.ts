import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { logger } from '@ingetin/logger';
import { RedisService } from './redis.service';
import { env } from '../../core/config';
import { MessagingProvider, ProviderStatus } from '../whatsapp/providers/messaging.provider';
import { CalendarService } from '../reminders/calendar.service';

// --- IP PROTECTION & CACHE CONFIG ---
const CACHE_DURATION = 30 * 1000; // 30 seconds (Real-time monitoring)
const BLOCK_COOLDOWN = 60 * 60 * 1000; // 1 hour safety lock if rate limited

interface HealthCache {
    whatsapp: 'OPERATIONAL' | 'DEGRADED' | 'PROTECTED';
    google: 'OPERATIONAL' | 'DEGRADED' | 'PROTECTED';
    database: 'CONNECTED' | 'DEGRADED';
    redis: 'CONNECTED' | 'DEGRADED';
}

export class HealthController {
    private healthCache: HealthCache | null = null;
    private lastCheck = 0;
    private circuitBreakerUntil = 0; // Timestamp to stop pings if blocked

    constructor(
        private readonly prisma: PrismaClient,
        private readonly redisService: RedisService,
        private readonly messagingProvider: MessagingProvider,
        private readonly calendarService: CalendarService,
        private readonly reminderQueue: Queue
    ) {}

    getEngineStatus = async (req: FastifyRequest, reply: FastifyReply) => {
        const [jobCounts, delayed] = await Promise.all([
            this.reminderQueue.getJobCounts('waiting', 'active', 'failed', 'completed'),
            this.reminderQueue.getDelayedCount()
        ]);

        return {
            engine: {
                status: 'ACTIVE',
                heartbeat: new Date().toISOString(),
                type: 'BULLMQ_REDIS'
            },
            queue: {
                ...jobCounts,
                delayed
            }
        };
    };

    getSystemPulse = async (req: FastifyRequest, reply: FastifyReply) => {
        const recentMessages = await this.prisma.message.findMany({
            take: 20,
            orderBy: { timestamp: 'desc' },
            select: { timestamp: true, direction: true, status: true }
        });

        const pulse = recentMessages.map((m) => ({
            time: m.timestamp,
            event: `TRAFFIC_${m.direction}`,
            message: '[REDACTED]',
            status: m.status
        }));

        return { pulse };
    };

    getProviderHealth = async (req: FastifyRequest, reply: FastifyReply) => {
        const now = Date.now();

        // 1. Check Circuit Breaker (IP Protection)
        if (now < this.circuitBreakerUntil) {
            return { 
                providers: this.healthCache || { whatsapp: 'PROTECTED', google: 'PROTECTED', database: 'CONNECTED', redis: 'CONNECTED' }, 
                source: 'circuit_breaker_active' 
            };
        }

        // 2. Check Cache
        if (this.healthCache && (now - this.lastCheck < CACHE_DURATION)) {
            return { providers: this.healthCache, source: 'cache' };
        }

        const fetchOptions = {
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'Ingetin-Monitor/1.0 (HealthCheck Node)' }
        };

        // Shallow pings
        const [waRes, googleRes] = await Promise.allSettled([
            fetch(env.META_API_URL, fetchOptions),
            fetch('https://www.googleapis.com/discovery/v1/apis?name=calendar', fetchOptions)
        ]);

        const waStatus = waRes.status === 'fulfilled' ? waRes.value.status : 500;
        const googleStatus = googleRes.status === 'fulfilled' ? googleRes.value.status : 500;

        // 3. Handle Rate Limiting (Error 429)
        if (waStatus === 429 || googleStatus === 429) {
            logger.warn('Rate limit detected from Meta/Google. Activating Circuit Breaker for 1 hour.');
            this.circuitBreakerUntil = now + BLOCK_COOLDOWN;
        }

        // Ping Redis for actual connection check
        let redisStatus: 'CONNECTED' | 'DEGRADED' = 'DEGRADED';
        try {
            await this.redisService.ping();
            redisStatus = 'CONNECTED';
        } catch (e: any) {
            logger.error({ msg: 'Health: Redis ping failed', error: e.message });
            redisStatus = 'DEGRADED';
        }

        // Ping database for actual connection check
        let dbStatus: 'CONNECTED' | 'DEGRADED' = 'DEGRADED';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = 'CONNECTED';
        } catch (e) {
            logger.warn('Health: Database ping failed');
        }

        this.healthCache = {
            whatsapp: this.messagingProvider.getStatus ? (this.messagingProvider.getStatus().state === 'OPEN' ? 'DEGRADED' : 'OPERATIONAL') : (waStatus < 500 ? 'OPERATIONAL' : 'DEGRADED'),
            google: this.calendarService.getStatus() ? (this.calendarService.getStatus().state === 'OPEN' ? 'DEGRADED' : 'OPERATIONAL') : (googleStatus === 200 ? 'OPERATIONAL' : 'DEGRADED'),
            database: dbStatus,
            redis: redisStatus
        };
        this.lastCheck = now;

        return { 
            providers: this.healthCache, 
            resilience: {
                whatsapp: this.messagingProvider.getStatus ? this.messagingProvider.getStatus() : null,
                google: this.calendarService.getStatus() ? this.calendarService.getStatus() : null
            },
            source: 'network' 
        };
    };
}