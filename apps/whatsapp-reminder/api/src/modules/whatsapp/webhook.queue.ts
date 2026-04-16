import { Queue } from 'bullmq';
import { bullConnection } from '../../core/bull-connection';

export const webhookQueue = new Queue('whatsapp-webhook', {
    connection: bullConnection,
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
