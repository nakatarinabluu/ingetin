import { Queue } from 'bullmq';
import { bullConnection } from '../../core/bull-connection';

export interface WhatsAppJob {
    messageId: string; // Internal DB ID
    to: string;
    type: 'otp' | 'notif';
    body: string;
    userId?: string;
    templateName?: string;
    components?: string[];
    timestamp: Date;
}

export const whatsappQueue = new Queue<WhatsAppJob>('whatsapp-outbound', {
    connection: bullConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 10000 // 10s initial delay
        },
        removeOnComplete: true,
        removeOnFail: {
            age: 24 * 3600 // Keep failed for 24h
        }
    }
});
