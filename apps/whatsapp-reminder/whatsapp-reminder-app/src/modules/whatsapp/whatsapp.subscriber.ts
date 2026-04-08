import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { logger } from '@ingetin/logger';
import { LiveService, LiveEvent } from './live.service';
import { UsageService, UsageType } from '../infra/usage.service';
import { metricsService } from '../infra/metrics.service';

import { MessagingProvider, MessagingResponse } from './providers/messaging.provider';
import { MessageRepository } from './message.repository';
import { MessageStatus } from '@prisma/client';

export class WhatsAppSubscriber {
    static init(
        liveService: LiveService, 
        usageService: UsageService,
        provider: MessagingProvider,
        messageRepository: MessageRepository
    ) {
        // 1. Welcome messaging (Placeholders for now)
        eventBus.on(DomainEvent.USER_REGISTERED, async ({ userId, username }) => {
            logger.info({ msg: 'WhatsAppSubscriber: Initiating welcome message', userId, username });
        });

        // 2. Handle successful outbound messages
        eventBus.on(DomainEvent.MESSAGE_SENT, async (data) => {
            const { messageId, to, type, body, userId, timestamp } = data;
            
            // Real-time UI updates
            liveService.sendPulse(`Sent ${type.toUpperCase()} to ${to}`, 'SUCCESS', 'SENT');
            liveService.broadcast(LiveEvent.CHAT_UPDATE, { 
                phone: to, 
                message: { whatsappId: messageId, to, body, direction: 'OUTBOUND', timestamp } 
            });
            liveService.broadcast(LiveEvent.STATS_UPDATE, { type: 'OUTBOUND_SUCCESS' });

            // Usage & Billing
            const usageType = type === 'otp' ? UsageType.OTP_SENT : UsageType.NOTIF_SENT;
            await usageService.logUsage(userId || 'SYSTEM', usageType, to, 'SUCCESS');

            // Prometheus Metrics
            metricsService.whatsappMessagesSent.inc({ type, provider: 'META' });
            
            logger.info({ msg: 'Event: MESSAGE_SENT processed', messageId, to });
        });

        // 3. Handle failed outbound messages
        eventBus.on(DomainEvent.MESSAGE_FAILED, async (data) => {
            const { to, type, error, userId } = data;

            liveService.sendPulse(`Failed to send ${type.toUpperCase()} to ${to}`, 'ERROR', 'SENT');
            liveService.broadcast(LiveEvent.STATS_UPDATE, { type: 'OUTBOUND_FAILURE' });

            const usageType = type === 'otp' ? UsageType.OTP_SENT : UsageType.NOTIF_SENT;
            await usageService.logUsage(userId || 'SYSTEM', usageType, to, 'FAILED');

            logger.error({ msg: 'Event: MESSAGE_FAILED processed', to, error });
        });

        // 4. Handle inbound messages (Live updates only, DB is handled by worker)
        eventBus.on(DomainEvent.CHAT_MESSAGE_RECEIVED, async (data) => {
            const phone = data.from;
            liveService.broadcast(LiveEvent.CHAT_UPDATE, { phone, message: data });
        });
    }
}
