import { MessageRepository } from './message.repository';
import { ConversationService } from './conversation.service';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { MessageDirection } from '@prisma/client';
import { formatPhone } from '../../utils/phoneFormatter';

export class MessageService {
    constructor(
        private readonly repository: MessageRepository,
        private readonly conversationService: ConversationService
    ) {}

    async getStats() {
        const [otpCount, notifCount] = await Promise.all([
            this.repository.countByType('OTP'),
            this.repository.countByType('NOTIF')
        ]);

        return {
            summary: { totalOTP: otpCount, totalNotif: notifCount },
            details: []
        };
    }

    async getChatThreads(page: number = 1, limit: number = 100, filter: 'VERIFIED' | 'UNVERIFIED' | 'ALL' = 'ALL') {
        const result = await this.repository.getConversationsPaginated(page, limit, filter);
        
        const threads = result.items.map((c) => ({
            phoneNumber: c.phoneNumber,
            body: c.lastMessageBody,
            direction: c.lastMessageDirection as MessageDirection,
            timestamp: c.lastMessageTimestamp,
            status: 'SENT', 
            username: c.username,
            isRegistered: c.isRegistered,
            unreadCount: c.unreadCount
        }));

        // Get dynamic stats for counters using optimized aggregation
        const stats = await this.repository.getDashboardStats();

        return { threads, total: result.total, stats };
    }

    async getThreadHistory(phone: string, page: number = 1, limit: number = 100) {
        if (!phone) return { messages: [], total: 0 };
        const normalized = formatPhone(phone);
        const skip = (page - 1) * limit;

        const where = {
            OR: [
                { from: normalized }, 
                { to: normalized }
            ]
        };

        const [{ items, total }] = await Promise.all([
            this.repository.findManyWithPagination(where, skip, limit, { orderBy: { timestamp: 'desc' } }),
            this.repository.count(where)
        ]);

        return { 
            messages: items.reverse(), 
            total,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async getMessages(userId: string, role: string, page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;
        let where = role === 'ADMIN' ? {} : { userId };

        const { items: messages, total } = await this.repository.findManyWithPagination(where, skip, limit, {
            include: role === 'ADMIN' ? { user: { select: { firstName: true, lastName: true, username: true } } } : undefined,
            orderBy: { timestamp: 'desc' }
        });

        return {
            messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async saveMessage(data: Parameters<ConversationService['syncMessage']>[0]) {
        await this.conversationService.syncMessage(data);
    }

    async markThreadAsRead(phone: string) {
        await this.conversationService.markRead(phone);
    }
}
