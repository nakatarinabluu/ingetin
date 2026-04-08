import { Queue } from 'bullmq';
import { env } from '../../core/config';

export const webhookQueue = new Queue('whatsapp-webhook', {
    connection: {
        url: env.REDIS_URL
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: 1000 // Keep failed for debugging
    }
});
