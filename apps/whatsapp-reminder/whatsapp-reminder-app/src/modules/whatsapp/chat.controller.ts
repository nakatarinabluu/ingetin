import { FastifyRequest, FastifyReply } from 'fastify';
import { MessageService } from './message.service';
import { AuthRequest } from '../../middlewares/auth';

interface PaginationQuery {
    page?: string;
    limit?: string;
    filter?: 'VERIFIED' | 'UNVERIFIED' | 'ALL';
}

interface PhoneParams {
    phone: string;
}

export class ChatController {
    constructor(private readonly messageService: MessageService) {}

    /**
     * Get global chat statistics (Admin only)
     */
    getStats = async (req: FastifyRequest, reply: FastifyReply) => {
        return await this.messageService.getStats();
    };

    /**
     * List all chat threads/conversations (Admin only)
     */
    getChatThreads = async (req: FastifyRequest, reply: FastifyReply) => {
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        const filter = query.filter || 'ALL';
        
        const result = await this.messageService.getChatThreads(page, limit, filter);
        
        return { 
            threads: result.threads,
            stats: result.stats,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    };

    /**
     * Get full message history for a specific phone number (Admin only)
     */
    getThreadHistory = async (req: FastifyRequest, reply: FastifyReply) => {
        const params = req.params as PhoneParams;
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        
        const result = await this.messageService.getThreadHistory(params.phone, page, limit);
        
        return { phone: params.phone, ...result };
    };

    /**
     * Get messages for the current user
     */
    getMessages = async (req: AuthRequest, reply: FastifyReply) => {
        const { role, id: userId } = req.user!;
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');

        return await this.messageService.getMessages(userId, role, page, limit);
    };

    /**
     * Mark all messages in a thread as read (Admin only)
     */
    markThreadAsRead = async (req: FastifyRequest, reply: FastifyReply) => {
        const params = req.params as PhoneParams;
        await this.messageService.markThreadAsRead(params.phone);
        return { message: 'Thread marked as read' };
    };
}
