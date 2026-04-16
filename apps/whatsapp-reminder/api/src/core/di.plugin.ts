import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { container } from './container';

async function diPlugin(fastify: FastifyInstance) {
    fastify.decorate('di', container);
}

export default fp(diPlugin, {
    name: 'ingetin-di'
});
