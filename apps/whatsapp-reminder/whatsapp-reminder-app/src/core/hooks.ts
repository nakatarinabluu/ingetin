import { FastifyInstance } from 'fastify';
import { logger } from '@ingetin/logger';
import { auditLog } from '../middlewares/audit';

export function registerCoreHooks(fastify: FastifyInstance) {
    // 1. Audit Logging
    fastify.addHook('onResponse', auditLog);

    // 2. HTTP Request Logging
    fastify.addHook('onRequest', (request, reply, done) => {
        logger.info({
            msg: 'Incoming API Request',
            requestId: request.id,
            method: request.method,
            url: request.url,
            ip: request.ip
        });
        done();
    });

    // 3. Raw Body Parser
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
        req.rawBody = body as string;
        try {
            done(null, JSON.parse(body as string));
        } catch (err) {
            done(err as Error);
        }
    });

    // 4. Global Header & Response Cleanup
    fastify.addHook('onSend', async (request, reply, payload) => {
        reply.header('X-Ingetin-Server', 'Fastify-API');
        return payload;
    });
}
