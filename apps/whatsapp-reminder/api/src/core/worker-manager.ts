import { logger } from '@ingetin/logger';
import { container } from './container';
import { AuthSubscriber } from '../modules/auth/auth.subscriber';
import { WhatsAppSubscriber } from '../modules/whatsapp/whatsapp.subscriber';
import { ReminderSubscriber } from '../modules/reminders/reminder.subscriber';
import { startReminderWorker, stopReminderWorker } from '../modules/reminders/reminder.worker';
import { startWebhookWorker, stopWebhookWorker } from '../modules/whatsapp/webhook.worker';
import { startWhatsAppWorker, stopWhatsAppWorker } from '../modules/whatsapp/whatsapp.worker';
import { startSystemWorker, scheduleSystemJobs, stopSystemWorker } from '../modules/reminders/system.worker';

class WorkerManager {
    private isRunning = false;

    async start() {
        if (this.isRunning) return;
        const serviceType = process.env.SERVICE_TYPE || 'ALL';
        
        if (serviceType === 'ALL' || serviceType === 'WORKER') {
            logger.info('Initializing background services...');
            
            // 1. Subscribers (Event Driven)
            AuthSubscriber.init();
            WhatsAppSubscriber.init(
                container.liveService, 
                container.usageService, 
                container.messagingProvider, 
                container.messageRepository
            );
            ReminderSubscriber.init();
            
            // 2. Job Workers (BullMQ)
            startReminderWorker(container.liveService, container.reminderRepository, container.templateService, container.whatsappService, container.usageService);
            startWhatsAppWorker(container.liveService, container.messagingProvider, container.messageRepository, container.usageService);
            startWebhookWorker(
                container.liveService, 
                container.messageRepository, 
                container.userRepository, 
                container.redisService, 
                container.conversationService,
                container.financeService,
                container.whatsappService
            );
            
            startSystemWorker(
                container.liveService, 
                container.calendarRepository, 
                container.calendarService, 
                container.reminderService, 
                container.reminderRepository, 
                container.userRepository, 
                container.whatsappService
            );
            await scheduleSystemJobs();
            
            this.isRunning = true;
            logger.info('Background workers and subscribers started.');
        } else {
            logger.info('API-only mode: Background workers skipped.');
        }
    }

    async stop() {
        if (!this.isRunning) return;
        logger.info('Shutting down background workers gracefully...');
        
        await Promise.allSettled([
            stopReminderWorker(),
            stopWhatsAppWorker(),
            stopWebhookWorker(),
            stopSystemWorker()
        ]);

        // Cleanup Subscribers if they have stop hooks
        // AuthSubscriber.stop() etc if implemented

        this.isRunning = false;
        logger.info('All background workers stopped.');
    }
}

export const workerManager = new WorkerManager();
