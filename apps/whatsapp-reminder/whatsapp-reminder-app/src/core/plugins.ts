import { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCompress from '@fastify/compress';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import fastifyRawBody from 'fastify-raw-body';
import fastifyMetrics from 'fastify-metrics';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import jwt from 'jsonwebtoken';
import { env } from './config';
import { logger } from '@ingetin/logger';
import { container } from './container';

export async function registerCorePlugins(fastify: FastifyInstance) {
    const isProd = process.env.NODE_ENV === 'production';
    const isDev = process.env.NODE_ENV === 'development';
    const allowedOrigins = [
        env.FRONTEND_URL,
        ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : [])
    ].filter(Boolean);

    // 1. Swagger
    await fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Ingetin WhatsApp API',
                description: 'Enterprise WhatsApp Automation & Notification Service',
                version: '1.0.0'
            },
            servers: [{ url: isProd ? env.FRONTEND_URL : `http://localhost:${env.PORT || 4005}` }]
        },
        transform: jsonSchemaTransform
    });
    
    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: { docExpansion: 'list', deepLinking: false }
    });

    // 2. Security & Utilities
    await fastify.register(fastifyRawBody, {
        field: 'rawBody',
        global: false, // Only for webhooks
        encoding: 'utf8',
        runFirst: true
    });

    await fastify.register(websocket);
    await fastify.register(fastifyCookie, {
        secret: env.JWT_SECRET,
        parseOptions: {
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            httpOnly: true,
            path: '/'
        }
    });

    await fastify.register(fastifyCompress, { global: true });

    if (!isDev) {
        await fastify.register(fastifyCsrfProtection, { cookieOpts: { signed: true } });
    } else {
        fastify.decorate('csrfProtection', (_req: unknown, _reply: unknown, done: () => void) => done());
        fastify.decorateReply('generateCsrf', () => 'dev-token-bypass');
    }

    await fastify.register(fastifyMetrics, { 
        endpoint: '/metrics',
        defaultMetrics: { enabled: true },
        routeMetrics: { enabled: true }
    });

    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
                imgSrc: ["'self'", "data:", "validator.swagger.io", "https://user-images.githubusercontent.com", "https://*.googleusercontent.com", "https://api.dicebear.com"],
                mediaSrc: ["'self'", "https://assets.mixkit.co"],
                connectSrc: ["'self'", "wss:", "https://*.ngrok.io", "https://*.ngrok-free.app", "http://localhost:*", "http://127.0.0.1:*"]
            }
        }
    });

    await fastify.register(cors, {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || (isDev && origin.includes('localhost'))) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    });

    // 3. Distributed Rate Limiting (Hardened)
    await fastify.register(rateLimit, {
        redis: container.redisService.instance, // Use the shared distributed Redis
        max: (req) => {
            if (req.user?.role === 'ADMIN') return 5000;
            if (req.user) return 1000;
            return 5000; // Increased significantly for SPA asset loading (Anonymous)
        },
        timeWindow: '1 minute',
        keyGenerator: (request) => {
            if (request.user?.id) return request.user.id;
            const token = request.cookies?.token || request.headers.authorization?.replace('Bearer ', '');
            if (token) {
                try {
                    const decoded = jwt.decode(token) as { id?: string } | null;
                    if (decoded?.id) return decoded.id;
                } catch (e) {
                    // Invalid token structure, fallback to IP
                }
            }
            return request.ip;
        },
        errorResponseBuilder: (request, context) => ({
            success: false,
            error: `Rate limit reached. Try again in ${context.after}.`,
            errorCode: 'RATE_LIMIT_EXCEEDED',
            requestId: request.id
        })
    });
}
