import { logger } from '@ingetin/logger';
import { MessagingProvider, MessagingResponse } from './providers/messaging.provider';
import { MessageRepository } from './message.repository';
import { MessagingPolicy } from './messaging.policy';
import { ConversationService } from './conversation.service';
import { Success, Failure, Result } from '../../core/result';
import { MessageDirection, MessageType, MessageStatus } from '@prisma/client';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { WHATSAPP_ALERTS } from './whatsapp.constants';

export interface WhatsAppSendResult {
    messageId?: string;
}

export class WhatsAppService {
    constructor(
        private readonly provider: MessagingProvider,
        private readonly messageRepository: MessageRepository,
        private readonly conversationService: ConversationService
    ) {}

    /**
     * Send a template message (e.g., OTP or Marketing) - ASYNC
     */
    async sendTemplate(type: 'otp' | 'notif', to: string, templateName: string, components: string[] = [], userId?: string): Promise<Result<WhatsAppSendResult>> {
        const body = `[TEMPLATE:${templateName}] ${components.join(' | ')}`;
        return this.queueMessage(type, to, body, userId, templateName, components);
    }

    /**
     * Send a plain text message - ASYNC
     */
    async sendText(type: 'otp' | 'notif', to: string, text: string, userId?: string): Promise<Result<WhatsAppSendResult>> {
        return this.queueMessage(type, to, text, userId);
    }

    /**
     * Internal helper to queue a message for background processing
     */
    private async queueMessage(
        type: 'otp' | 'notif', 
        to: string, 
        body: string, 
        userId?: string, 
        templateName?: string, 
        components?: string[]
    ): Promise<Result<WhatsAppSendResult>> {
        const timestamp = new Date();
        
        // 1. Persistence with PENDING/QUEUED status
        const message = await this.messageRepository.create({
            whatsappId: `PENDING_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            from: 'SYSTEM',
            to,
            body,
            direction: MessageDirection.OUTBOUND,
            messageType: type === 'otp' ? MessageType.OTP : MessageType.NOTIF,
            status: MessageStatus.QUEUED,
            userId: userId || null,
            timestamp
        });

import { whatsappQueue } from './whatsapp.queue';
...
        // 2. Add to BullMQ Queue for persistent, retriable processing
        await whatsappQueue.add('send-whatsapp', {
            messageId: message.id, // Internal DB ID
            to,
            type,
            body,
            userId,
            timestamp,
            templateName,
            components
        }, {
            jobId: `out_${message.id}`, // Idempotency
            priority: type === 'otp' ? 1 : 10 // OTPs get higher priority (Lower number = higher priority)
        });

        logger.info({ msg: 'Message Queued to BullMQ', internalId: message.id, to, type });
        return Success({ messageId: message.id });
    }

    /**
     * Smart notification sender with 24-hour window awareness.
     * Uses MessagingPolicy to determine if free-text or template should be used.
     */
    async sendNotification(userId: string, to: string, message: string, templateName?: string, components?: string[]): Promise<Result<WhatsAppSendResult>> {
        const conversation = await this.messageRepository.getConversation(to);
        
        const canSendFreeText = MessagingPolicy.canSendFreeText(conversation);

        if (!canSendFreeText || templateName) {
            const fallback = MessagingPolicy.getFallbackTemplate(message);
            const tName = templateName || fallback.name;
            const tParams = components || fallback.components;
            
            logger.info({ msg: !canSendFreeText ? '24h Window Expired: Using policy template' : 'Template requested', to });
            return await this.sendTemplate('notif', to, tName, tParams, userId);
        }

        // Within window, send as free-form text
        return await this.sendText('notif', to, message, userId);
    }

    /**
     * Notify user about a sync failure (e.g. Google Token expired)
     */
    async sendSyncFailureAlert(userId: string, phoneNumber: string): Promise<Result<WhatsAppSendResult>> {
        logger.warn({ msg: 'Sending Sync Failure Alert', userId, phoneNumber });
        return await this.sendTemplate(
            'notif', 
            phoneNumber, 
            WHATSAPP_ALERTS.SYNC_FAILURE.template, 
            WHATSAPP_ALERTS.SYNC_FAILURE.defaultComponents, 
            userId
        );
    }

    /**
     * Notify user about missed reminders due to system issues
     */
    async sendMissedReminderAlert(userId: string, phoneNumber: string, count: number): Promise<Result<WhatsAppSendResult>> {
        logger.warn({ msg: 'Sending Missed Reminders Alert', userId, phoneNumber, count });
        const message = WHATSAPP_ALERTS.MISSED_REMINDERS.getMessage(count);
        
        // Try to send via 24h window logic
        return await this.sendNotification(userId, phoneNumber, message, WHATSAPP_ALERTS.MISSED_REMINDERS.template, [count.toString()]);
    }

}
