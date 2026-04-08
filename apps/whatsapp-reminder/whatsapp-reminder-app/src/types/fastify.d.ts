import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: 'ADMIN' | 'USER';
      [key: string]: any;
    };
    rawBody?: string;
  }

  interface FastifyReply {
    generateCsrf: () => string;
  }
}
