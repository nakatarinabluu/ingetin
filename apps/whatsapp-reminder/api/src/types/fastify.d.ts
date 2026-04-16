import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    di: typeof import('../core/container').container;
  }

  interface FastifyRequest {
    user?: {
      id: string;
      role: 'ADMIN' | 'USER';
      jti?: string;
      username?: string;
      isActivated?: boolean;
    };
    rawBody?: string;
  }

  interface FastifyReply {
    generateCsrf: () => string;
  }
}
