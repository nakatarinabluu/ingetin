import { FastifyRequest, FastifyReply, RouteHandler, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifySchema, RouteGenericInterface } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { MessageService } from './message.service';

interface PaginationQuery extends RouteGenericInterface {
    Querystring: {
        page?: string;
        limit?: string;
        filter?: 'VERIFIED' | 'UNVERIFIED' | 'ALL';
    };
}

interface PhoneParams extends RouteGenericInterface {
    Params: {
        phone: string;
    };
}

interface ThreadHistoryRequest extends RouteGenericInterface {
    Params: { phone: string };
    Querystring: {
        page?: string;
        limit?: string;
    };
}

// Custom strictly typed handler for ZodTypeProvider
type TypedHandler<T extends RouteGenericInterface = RouteGenericInterface> = RouteHandler<
    T, 
    RawServerDefault, 
    RawRequestDefaultExpression, 
    RawReplyDefaultExpression, 
    any, 
    FastifySchema, 
    ZodTypeProvider
>;

export class ChatController {
    constructor(private readonly messageService: MessageService) {}

    /**
     * Get global chat statistics (Admin only)
     */
    getStats: TypedHandler = async (req, reply) => {
        const stats = await this.messageService.getStats();
        return reply.send({ success: true, data: stats });
    };

    /**
     * List all chat threads/conversations (Admin only)
     */
    getChatThreads: TypedHandler<PaginationQuery> = async (req, reply) => {
        const { page: pageStr, limit: limitStr, filter = 'ALL' } = req.query;
        const page = parseInt(pageStr || '1');
        const limit = parseInt(limitStr || '50');
        
        const result = await this.messageService.getChatThreads(page, limit, filter);
        
        return reply.send({ 
            success: true,
            data: {
                items: result.threads,
                stats: result.stats,
                pagination: {
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                }
            }
        });
    };

    /**
     * Get full message history for a specific phone number (Admin only)
     */
    getThreadHistory: TypedHandler<ThreadHistoryRequest> = async (req, reply) => {
        const { phone } = req.params;
        const { page: pageStr, limit: limitStr } = req.query;
        const page = parseInt(pageStr || '1');
        const limit = parseInt(limitStr || '50');
        
        const result = await this.messageService.getThreadHistory(phone, page, limit);
        
        return reply.send({ 
            success: true,
            data: { phone, ...result }
        });
    };

    /**
     * Get messages for the current user
     */
    getMessages: TypedHandler<PaginationQuery> = async (req, reply) => {
        const { role, id: userId } = req.user!;
        const { page: pageStr, limit: limitStr } = req.query;
        const page = parseInt(pageStr || '1');
        const limit = parseInt(limitStr || '50');

        const result = await this.messageService.getMessages(userId, role, page, limit);
        return reply.send({ success: true, data: result });
    };

    /**
     * Mark all messages in a thread as read (Admin only)
     */
    markThreadAsRead: TypedHandler<PhoneParams> = async (req, reply) => {
        const { phone } = req.params;
        await this.messageService.markThreadAsRead(phone);
        return reply.send({ success: true, data: { message: 'Thread marked as read' } });
    };
}
