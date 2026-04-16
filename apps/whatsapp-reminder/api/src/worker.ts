import './instrumentation';
import { logger } from '@ingetin/logger';
import prisma from './modules/infra/prisma.service';
import { container } from './core/container';
import { startReminderWorker, stopReminderWorker } from './modules/reminders/reminder.worker';
import { startDomainEventWorker, stopDomainEventWorker } from './modules/infra/domain-event.worker';

async function start() {
    try {
        logger.info('WORKER STARTING: Ingetin Background Processor');

        // Initialize background workers with manual dependency injection
        // This decouples the worker lifecycle from the main API process
        startReminderWorker(
            container.liveService,
            container.reminderRepository,
            container.templateService,
            container.whatsappService,
            container.usageService
        );

        startDomainEventWorker(
            container.reminderService,
            container.usageService,
            container.redisService
        );

        logger.info('WORKER READY: Background services initialized');

        // Graceful Shutdown - Official recommendation for BullMQ & Prisma
        const shutdown = async (signal: string) => {
            logger.warn({ msg: 'WORKER SHUTDOWN TRIGGERED', signal });
            await stopReminderWorker();
            await stopDomainEventWorker();
            await prisma.$disconnect();
            logger.info('Worker process exited cleanly.');
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (err) {
        logger.error({ msg: 'FATAL WORKER ERROR', err });
        process.exit(1);
    }
}

start();
