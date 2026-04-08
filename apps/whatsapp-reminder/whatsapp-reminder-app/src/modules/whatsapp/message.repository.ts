import { PrismaClient, Prisma, Message, MessageStatus, MessageDirection } from '@prisma/client';
import { formatPhone } from '../../utils/phoneFormatter';

export class MessageRepository {
    constructor(public readonly prismaDb: PrismaClient) {}

    async findById(id: string): Promise<Message | null> {
        return await this.prismaDb.message.findUnique({ where: { id } });
    }

    async findAll(params?: { 
        skip?: number; 
        take?: number; 
        where?: Prisma.MessageWhereInput; 
        orderBy?: Prisma.MessageOrderByWithRelationInput;
    }): Promise<Message[]> {
        return await this.prismaDb.message.findMany(params);
    }

    async count(where?: Prisma.MessageWhereInput): Promise<number> {
        return await this.prismaDb.message.count({ where });
    }

    async create(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
        return await this.prismaDb.message.create({ data });
    }

    async update(id: string, data: Prisma.MessageUpdateInput): Promise<Message> {
        return await this.prismaDb.message.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Message> {
        return await this.prismaDb.message.delete({
            where: { id }
        });
    }

    async countByType(type: 'OTP' | 'NOTIF') {
        return this.prismaDb.message.count({ where: { messageType: type } });
    }

    async findRecent(limit: number) {
        return this.prismaDb.message.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { firstName: true, lastName: true, username: true } } }
        });
    }

    async upsertConversation(data: { 
        phoneNumber: string; 
        body: string; 
        timestamp: Date; 
        direction: MessageDirection; 
        isRegistered: boolean; 
        username?: string | null; 
        userId?: string | null 
    }) {
        const payload = {
            lastMessageBody: data.body,
            lastMessageTimestamp: data.timestamp,
            lastMessageDirection: data.direction,
            isRegistered: data.isRegistered,
            username: data.username,
            userId: data.userId
        };

        return this.prismaDb.conversation.upsert({
            where: { phoneNumber: data.phoneNumber },
            update: payload,
            create: {
                phoneNumber: data.phoneNumber,
                ...payload
            }
        });
    }

    async getConversation(phone: string) {
        return this.prismaDb.conversation.findUnique({
            where: { phoneNumber: phone }
        });
    }

    async getConversations() {
        return this.prismaDb.conversation.findMany({
            orderBy: { lastMessageTimestamp: 'desc' }
        });
    }

    async updateStatus(id: string, status: MessageStatus, whatsappId?: string) {
        return this.prismaDb.message.update({
            where: { id },
            data: { 
                status,
                ...(whatsappId ? { whatsappId } : {})
            }
        });
    }

    async updateStatusByWhatsappId(whatsappId: string, status: MessageStatus) {
        return this.prismaDb.message.update({
            where: { whatsappId },
            data: { status }
        });
    }

    async findUnique(args: Prisma.MessageFindUniqueArgs) {
        return this.prismaDb.message.findUnique(args);
    }

    async incrementUnread(phone: string) {
        return this.prismaDb.conversation.update({
            where: { phoneNumber: phone },
            data: { unreadCount: { increment: 1 } }
        });
    }

    async getConversationsPaginated(page: number, limit: number, filter: 'VERIFIED' | 'UNVERIFIED' | 'ALL') {
        const skip = (page - 1) * limit;
        const where: Prisma.ConversationWhereInput = {};
        if (filter === 'VERIFIED') where.isRegistered = true;
        if (filter === 'UNVERIFIED') where.isRegistered = false;

        const [items, total] = await Promise.all([
            this.prismaDb.conversation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { lastMessageTimestamp: 'desc' }
            }),
            this.prismaDb.conversation.count({ where })
        ]);

        return { items, total };
    }

    async getDashboardStats() {
        const [verified, unverified] = await Promise.all([
            this.prismaDb.conversation.count({ where: { isRegistered: true } }),
            this.prismaDb.conversation.count({ where: { isRegistered: false } })
        ]);

        const verifiedUnread = await this.prismaDb.conversation.aggregate({
            where: { isRegistered: true },
            _sum: { unreadCount: true }
        });

        const unverifiedUnread = await this.prismaDb.conversation.aggregate({
            where: { isRegistered: false },
            _sum: { unreadCount: true }
        });

        return {
            verified,
            unverified,
            verifiedUnread: verifiedUnread._sum.unreadCount || 0,
            unverifiedUnread: unverifiedUnread._sum.unreadCount || 0
        };
    }

    async findManyWithPagination(where: Prisma.MessageWhereInput, skip: number, take: number, options?: Prisma.MessageFindManyArgs) {
        const [items, total] = await Promise.all([
            this.prismaDb.message.findMany({
                where,
                skip,
                take,
                ...options
            }),
            this.prismaDb.message.count({ where })
        ]);
        return { items, total };
    }

    async findUserByPartner(userId: string | undefined, partnerPhone: string) {
        if (!userId) return null;
        const normalized = formatPhone(partnerPhone);
        return this.prismaDb.user.findFirst({
            where: {
                id: userId,
                phoneNumber: normalized
            }
        });
    }

    async markConversationRead(phone: string) {
        const normalized = formatPhone(phone);
        return this.prismaDb.conversation.updateMany({
            where: { phoneNumber: normalized },
            data: { unreadCount: 0 }
        });
    }
}
