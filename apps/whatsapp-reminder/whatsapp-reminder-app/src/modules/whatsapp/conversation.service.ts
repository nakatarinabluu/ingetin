import { MessageRepository } from './message.repository';
import { MessageDirection } from '@prisma/client';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';

export class ConversationService {
    constructor(private readonly repository: MessageRepository) {}

    async syncMessage(data: {
        userId?: string;
        body: string;
        from: string;
        to: string;
        direction: MessageDirection;
        timestamp?: Date;
    }) {
        const phone = data.direction === 'INBOUND' ? data.from : data.to;
        
        // Lookup user to link metadata (fullName, etc) to the conversation
        const user = await this.repository.findUserByPartner(data.userId, phone);

        await this.repository.upsertConversation({
            phoneNumber: phone,
            body: data.body,
            timestamp: data.timestamp || new Date(),
            direction: data.direction,
            isRegistered: !!user,
            username: user?.username,
            userId: user?.id
        });

        // Increment unread count for inbound messages
        if (data.direction === 'INBOUND') {
            await this.repository.incrementUnread(phone);
        }

        // Broadcast for live dashboard updates
        eventBus.emitDomainEvent(DomainEvent.CHAT_MESSAGE_RECEIVED, { 
            messageId: '', // Ideally actual message ID from upsert
            from: data.from,
            body: data.body,
            userId: user?.id,
            timestamp: data.timestamp || new Date()
        });
    }

    async markRead(phone: string) {
        if (!phone) return;
        const raw = phone.replace(/\D/g, '');
        
        await Promise.all([
            this.repository.prismaDb.message.updateMany({
                where: {
                    OR: [{ from: phone }, { from: raw }, { from: { contains: raw.slice(-10) } }],
                    direction: 'INBOUND',
                    status: 'DELIVERED'
                },
                data: { status: 'READ' }
            }),
            this.repository.markConversationRead(phone)
        ]);
    }
}
