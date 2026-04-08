import './instrumentation';
import { startReminderWorker, stopReminderWorker } from './modules/reminders/reminder.worker';
import { startCalendarWorker, stopCalendarWorker } from './modules/reminders/calendar.worker';
import { startWebhookWorker, stopWebhookWorker } from './modules/whatsapp/webhook.worker';
import { startSystemWorker, scheduleSystemJobs } from './modules/reminders/system.worker';
import { startDomainEventWorker, stopDomainEventWorker } from './modules/infra/domain-event.worker';
import { AuthSubscriber } from './modules/auth/auth.subscriber';
import { WhatsAppSubscriber } from './modules/whatsapp/whatsapp.subscriber';
import { ReminderSubscriber } from './modules/reminders/reminder.subscriber';
import { logger } from '@ingetin/logger';
import { container } from './core/container';
import prisma from './modules/infra/prisma.service';

/**
 * WORKER ENTRY POINT: INGETIN WHATSAPP WORKER
 * This process runs background tasks, subscribers, and BullMQ workers.
 * It does NOT start the Fastify HTTP server.
 */
async function start() {
    logger.info('WORKER STARTING: Ingetin WhatsApp Worker Instance');

    try {
        // Initialize subscribers (Local listeners for non-persistent side effects)
        AuthSubscriber.init();
        WhatsAppSubscriber.init(
        container.liveService, 
        container.usageService, 
        container.messagingProvider, 
        container.messageRepository
    );
        ReminderSubscriber.init();

        // Start BullMQ workers
        startDomainEventWorker();
        startReminderWorker(container.liveService);
        startCalendarWorker();
        startWebhookWorker(
            container.liveService, 
            container.messageRepository, 
            container.userRepository, 
            container.redisService, 
            container.conversationService
        );
        
        // Start system maintenance workers
        startSystemWorker(container.liveService);
        await scheduleSystemJobs();

        logger.info('WORKER READY: Background services active');
    } catch (err: any) {
        logger.error({ msg: 'Worker startup failed', error: ((err as Error).message) });
        process.exit(1);
    }
}

start();

// Graceful Shutdown
const shutdown = async (signal: string) => {
    logger.warn({ msg: `Worker received ${signal}. Starting graceful shutdown...` });
    
    try {
        await Promise.all([
            stopDomainEventWorker(),
            stopReminderWorker(),
            stopCalendarWorker(),
            stopWebhookWorker()
        ]);
        await prisma.$disconnect();
        logger.info('Worker: Database disconnected and workers stopped.');
        process.exit(0);
    } catch (err: any) {
        logger.error({ msg: 'Worker: Error during shutdown', error: ((err as Error).message) });
        process.exit(1);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
