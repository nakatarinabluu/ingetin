import fastifyCsrfProtection from '@fastify/csrf-protection';
import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
    await fastify.register(fastifyCsrfProtection, { cookieOpts: { signed: true } });
}
