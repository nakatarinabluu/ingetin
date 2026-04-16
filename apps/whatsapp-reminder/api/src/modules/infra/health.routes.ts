import { FastifyPluginAsync } from 'fastify';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth';
import { WebSocket } from 'ws';

import prisma from './prisma.service';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
    const { di } = fastify;

    // Public Diagnostics
    fastify.get('/', async () => ({
        status: 'online',
        message: 'Ingetin WhatsApp API Gateway',
        version: '1.5.0 (BullMQ Powered)'
    }));

    fastify.get('/health', async () => ({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    }));

    fastify.get('/ready', async (request, reply) => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return { status: 'ready', database: 'connected' };
        } catch (e) {
            reply.status(503);
            return { status: 'unready', database: 'disconnected' };
        }
    });

    // Admin only telemetry
    fastify.get('/admin/health/engine', { preHandler: [authMiddleware, adminMiddleware] }, di.healthController.getEngineStatus);
    fastify.get('/admin/health/pulse', { preHandler: [authMiddleware, adminMiddleware] }, di.healthController.getSystemPulse);
    fastify.get('/admin/health/providers', { preHandler: [authMiddleware, adminMiddleware] }, di.healthController.getProviderHealth);
    fastify.get('/admin/health/dashboard', { preHandler: [authMiddleware, adminMiddleware] }, di.adminMonitorController.getDashboardStats);

    // Real-time Monitoring Feed
    // In Fastify 5, the handler for websocket: true receives (socket, request)
    fastify.get('/live', { websocket: true }, (socket: WebSocket) => {
        di.liveService.addSocket(socket);
    });
};

export default healthRoutes;
