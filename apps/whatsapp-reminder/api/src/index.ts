import { logger } from '@ingetin/logger';
import { env } from './core/config';
import prisma from './modules/infra/prisma.service';
import { buildApp } from './app';

async function start() {
    try {
        const fastify = await buildApp();
        
        logger.info('SYSTEM STARTING: Ingetin WhatsApp API Node');

        // Listen
        const PORT = Number(env.PORT) || 4000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        
        logger.info({ msg: 'SYSTEM READY', port: PORT });

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

    } catch (err) {
        logger.error({ msg: 'FATAL STARTUP ERROR', err });
        process.exit(1);
    }
}

start();
