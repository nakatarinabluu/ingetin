import './instrumentation';
import Fastify, { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { ZodTypeProvider, validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { registerCorePlugins } from './core/plugins';
import { setErrorHandler } from './core/errors/handler';
import { registerCoreHooks } from './core/hooks';
import { backgroundServices } from './core/background-services';

// Import Routes
import whatsappRoutes from './modules/whatsapp/whatsapp.routes';
import userRoutes from './modules/auth/user.routes';
import authRoutes from './modules/auth/auth.routes';
import healthRoutes from './modules/infra/health.routes';
import financeRoutes from './modules/finances/finance.routes';
import reminderRoutes from './modules/reminders/reminder.routes';
import { container } from './core/container';
import diPlugin from './core/di.plugin';

export async function buildApp(): Promise<FastifyInstance> {
    const fastify = Fastify({
        logger: true,
        trustProxy: true,
        genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID()
    }).withTypeProvider<ZodTypeProvider>();

    // 1. Setup Core Infrastructure
    await fastify.register(diPlugin);
    
    // Set Zod Compilers
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    await registerCorePlugins(fastify);
    registerCoreHooks(fastify);
    setErrorHandler(fastify);
    
    // 2. Lifecycle Managed Services (Background Workers)
    await fastify.register(backgroundServices);

    // 3. Register Routes
    await fastify.register(whatsappRoutes, { prefix: '/api/whatsapp' });
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.register(healthRoutes, { prefix: '/api' });
    await fastify.register(financeRoutes, { prefix: '/api/finances' });
    await fastify.register(reminderRoutes, { prefix: '/api/reminders' });

    // 4. Not Found Handler
    fastify.setNotFoundHandler((req, reply) => {
        return reply.status(404).send({ 
            success: false, 
            error: 'Endpoint Not Found',
            errorCode: 'NOT_FOUND',
            requestId: req.id
        });
    });

    return fastify;
}
