import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { workerManager } from './worker-manager';

/**
 * Fastify plugin to manage background services lifecycle
 */
async function backgroundServicesPlugin(fastify: FastifyInstance) {
    // Start services once Fastify is ready
    fastify.addHook('onReady', async () => {
        await workerManager.start();
    });

    // Stop services when Fastify starts closing
    fastify.addHook('onClose', async () => {
        await workerManager.stop();
    });
}

export const backgroundServices = fp(backgroundServicesPlugin, {
    name: 'background-services',
    fastify: '^5.0.0'
});
