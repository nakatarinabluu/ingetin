import './instrumentation';
import Fastify from 'fastify';
import crypto from 'crypto';
import { ZodTypeProvider, validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { logger } from '@ingetin/logger';
import { env } from './core/config';
import { registerCorePlugins } from './core/plugins';
import { setErrorHandler } from './core/errors/handler';
import { registerCoreHooks } from './core/hooks';
import { bootstrapServices } from './core/worker-manager';
import fastifyStatic from '@fastify/static';
import path from 'path';

// Import Routes
import whatsappRoutes from './modules/whatsapp/whatsapp.routes';
import userRoutes from './modules/auth/user.routes';
import authRoutes from './modules/auth/auth.routes';
import healthRoutes from './modules/infra/health.routes';
import prisma from './modules/infra/prisma.service';

const fastify = Fastify({
    logger: true,
    trustProxy: true,
    genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID()
}).withTypeProvider<ZodTypeProvider>();

// Set Zod Compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

async function start() {
    try {
        logger.info('SYSTEM STARTING: Ingetin WhatsApp API Node');

        // 1. Setup Core Infrastructure
        await registerCorePlugins(fastify);
        registerCoreHooks(fastify);
        setErrorHandler(fastify);

        // 2. Register Routes
        await fastify.register(whatsappRoutes, { prefix: '/api/whatsapp' });
        await fastify.register(authRoutes, { prefix: '/api/auth' });
        await fastify.register(userRoutes, { prefix: '/api/users' });
        await fastify.register(healthRoutes, { prefix: '/api' });

        // 3. Serve Frontend Static Files
        const publicPath = path.resolve(process.cwd(), 'public');
        logger.info({ msg: 'Serving Static Files', path: publicPath });

        await fastify.register(fastifyStatic, {
            root: publicPath,
            preCompressed: true,
            wildcard: false 
        });

        // SPA Catch-all: Redirect unknown non-API routes to index.html
        fastify.setNotFoundHandler((req, reply) => {
            if (req.url.startsWith('/api/')) {
                return reply.status(404).send({ 
                    success: false, 
                    error: 'Endpoint Not Found',
                    errorCode: 'NOT_FOUND',
                    requestId: req.id
                });
            }
            return reply.sendFile('index.html');
        });

        // 4. Listen
        const PORT = Number(env.PORT) || 4000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        
        logger.info({ msg: 'SYSTEM READY', port: PORT });

        // 4. Background Services
        await bootstrapServices();

    } catch (err) {
        logger.error({ msg: 'FATAL STARTUP ERROR', err });
        process.exit(1);
    }
}

// Graceful Shutdown
const shutdown = async (signal: string) => {
    logger.warn({ msg: 'SHUTDOWN TRIGGERED', signal });
    await fastify.close();
    await prisma.$disconnect();
    logger.info('Process exited cleanly.');
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
