import { FastifyPluginAsync } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { container } from '../../core/container';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth';

import prisma from './prisma.service';

const healthRoutes: FastifyPluginAsync = async (fastify, opts) => {
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
    fastify.get('/admin/health/engine', { preHandler: [authMiddleware, adminMiddleware] }, container.healthController.getEngineStatus);
    fastify.get('/admin/health/pulse', { preHandler: [authMiddleware, adminMiddleware] }, container.healthController.getSystemPulse);
    fastify.get('/admin/health/providers', { preHandler: [authMiddleware, adminMiddleware] }, container.healthController.getProviderHealth);
    fastify.get('/admin/health/dashboard', { preHandler: [authMiddleware, adminMiddleware] }, container.adminMonitorController.getDashboardStats);

    // Real-time Monitoring Feed
    fastify.get('/live', { websocket: true }, (connection: SocketStream, req) => {
        container.liveService.addClient(connection.socket);
    });
};

export default healthRoutes;
