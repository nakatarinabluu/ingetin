import { logger } from '@ingetin/logger';
import { container } from './container';
import { AuthSubscriber } from '../modules/auth/auth.subscriber';
import { WhatsAppSubscriber } from '../modules/whatsapp/whatsapp.subscriber';
import { ReminderSubscriber } from '../modules/reminders/reminder.subscriber';
import { startReminderWorker } from '../modules/reminders/reminder.worker';
import { startWebhookWorker } from '../modules/whatsapp/webhook.worker';
import { startWhatsAppWorker } from '../modules/whatsapp/whatsapp.worker';
import { startSystemWorker, scheduleSystemJobs } from '../modules/reminders/system.worker';

export async function bootstrapServices() {
    const serviceType = process.env.SERVICE_TYPE || 'ALL';
    
    if (serviceType === 'ALL' || serviceType === 'WORKER') {
        logger.info('Initializing background services...');
        
        AuthSubscriber.init();
        WhatsAppSubscriber.init(
            container.liveService, 
            container.usageService, 
            container.messagingProvider, 
            container.messageRepository
        );
        ReminderSubscriber.init();
        
        startReminderWorker(container.liveService);
        startWhatsAppWorker(container.liveService);
        startWebhookWorker(
            container.liveService, 
            container.messageRepository, 
            container.userRepository, 
            container.redisService, 
            container.conversationService
        );
        
        startSystemWorker(container.liveService);
        await scheduleSystemJobs();
        
        logger.info('Background workers and subscribers started.');
    } else {
        logger.info('API-only mode: Background workers skipped.');
    }
}
