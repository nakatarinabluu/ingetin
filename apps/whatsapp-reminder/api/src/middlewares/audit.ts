import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@ingetin/logger';

export const auditLog = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;
    const body = request.body;
    
    // Omit sensitive fields from body
    let sanitizedBody = body;
    if (body && typeof body === 'object') {
        const { password, token, ...rest } = body as Record<string, unknown>;
        sanitizedBody = rest;
    }

    logger.info({
        msg: 'Audit Log',
        requestId: request.id,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userId: user?.id || 'anonymous',
        body: sanitizedBody,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime
    });
};
