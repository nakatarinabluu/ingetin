import { Queue } from 'bullmq';
import { env } from '../../core/config';

export const calendarQueue = new Queue('calendar-sync', {
    connection: {
        url: env.REDIS_URL
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000 // 5s, 25s, 125s...
        },
        removeOnComplete: 100, // Keep some history
        removeOnFail: 500
    }
});
