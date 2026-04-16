import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { WebSocket } from 'ws';
import { logger } from '@ingetin/logger';
import { authMiddleware, adminMiddleware, licenseMiddleware, setupMiddleware } from '../../middlewares/auth';
import { 
    OTPSendSchema, 
    OTPVerifySchema,
    SendNotificationSchema
} from '@ingetin/types';

const whatsappRoutes: FastifyPluginAsync = async (fastify, opts) => {
    const { di } = fastify;
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    
    // --- 1. Messaging & History ---
    typedFastify.get('/messages', { preHandler: [authMiddleware, licenseMiddleware] }, di.chatController.getMessages);
    typedFastify.post('/notify', { 
        preHandler: [authMiddleware, licenseMiddleware, setupMiddleware],
        schema: { body: SendNotificationSchema }
    }, di.webhookController.sendNotification);

    // --- 2. Chat Monitoring (Admin Only) ---
    typedFastify.get('/chats', { preHandler: [authMiddleware, adminMiddleware] }, di.chatController.getChatThreads);
    typedFastify.get('/chats/:phone', { preHandler: [authMiddleware, adminMiddleware] }, di.chatController.getThreadHistory);
    typedFastify.post('/chats/:phone/read', { preHandler: [authMiddleware, adminMiddleware] }, di.chatController.markThreadAsRead);

    // --- 3. OTP Verification System (Used to LINK the account) ---
    typedFastify.post('/otp/send', { 
        preHandler: [authMiddleware, licenseMiddleware],
        onRequest: fastify.csrfProtection,
        schema: { body: OTPSendSchema },
        config: { rateLimit: { max: 3, timeWindow: '1 minute' } }
    }, di.otpController.sendOTP);
    typedFastify.post('/otp/verify', { 
        preHandler: [authMiddleware, licenseMiddleware],
        onRequest: fastify.csrfProtection,
        schema: { body: OTPVerifySchema },
        config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
    }, di.otpController.verifyOTP);

    // --- 4. Webhook & Monitoring ---
    typedFastify.get('/webhook', di.webhookController.verifyWebhook);
    typedFastify.post('/webhook', di.webhookController.handleWebhook);
    typedFastify.get('/stats', { preHandler: [authMiddleware, adminMiddleware] }, di.chatController.getStats);

    // --- 5. Real-time Live Monitoring (WebSocket) ---
    fastify.get('/ws', { 
        websocket: true
    }, (socket: WebSocket, req) => {
        logger.info({ msg: '[WS HANDSHAKE] Upgrade request received', headers: req.headers });
        di.liveService.addSocket(socket);
    });
};

export default whatsappRoutes;
