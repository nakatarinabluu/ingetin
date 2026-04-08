import { FastifyPluginAsync } from 'fastify';
import { container } from '../../core/container';
import { authMiddleware, adminMiddleware, licenseMiddleware, setupMiddleware } from '../../middlewares/auth';
import { 
    ReminderSchema, 
    OTPSendSchema, 
    OTPVerifySchema 
} from '@ingetin/types';

const whatsappRoutes: FastifyPluginAsync = async (fastify, opts) => {
    
    // --- 1. Messaging & History ---
    fastify.get('/messages', { preHandler: [authMiddleware, licenseMiddleware] }, container.chatController.getMessages);
    fastify.post('/notify', { preHandler: [authMiddleware, licenseMiddleware, setupMiddleware] }, container.webhookController.sendNotification);

    // --- 2. Chat Monitoring (Admin Only) ---
    fastify.get('/chats', { preHandler: [authMiddleware, adminMiddleware] }, container.chatController.getChatThreads);
    fastify.get('/chats/:phone', { preHandler: [authMiddleware, adminMiddleware] }, container.chatController.getThreadHistory);
    fastify.post('/chats/:phone/read', { preHandler: [authMiddleware, adminMiddleware] }, container.chatController.markThreadAsRead);

    // --- 3. Personal Reminders ---
    fastify.get('/reminders', { preHandler: [authMiddleware, licenseMiddleware, setupMiddleware] }, container.reminderController.getReminders);
    fastify.post('/reminders', { 
        preHandler: [authMiddleware, licenseMiddleware, setupMiddleware],
        schema: { body: ReminderSchema }
    }, container.reminderController.createReminder);
    fastify.post('/reminders/sync', { preHandler: [authMiddleware, licenseMiddleware, setupMiddleware] }, container.reminderController.syncReminders);
    fastify.delete('/reminders/:id', { preHandler: [authMiddleware, licenseMiddleware, setupMiddleware] }, container.reminderController.deleteReminder);

    // --- 4. OTP Verification System (Used to LINK the account) ---
    fastify.post('/otp/send', { 
        preHandler: [authMiddleware, licenseMiddleware],
        onRequest: fastify.csrfProtection,
        schema: { body: OTPSendSchema },
        config: { rateLimit: { max: 3, timeWindow: '1 minute' } }
    }, container.otpController.sendOTP);
    fastify.post('/otp/verify', { 
        preHandler: [authMiddleware, licenseMiddleware],
        onRequest: fastify.csrfProtection,
        schema: { body: OTPVerifySchema },
        config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
    }, container.otpController.verifyOTP);

    // --- 5. Webhook & Monitoring ---
    fastify.get('/webhook', container.webhookController.verifyWebhook);
    fastify.post('/webhook', container.webhookController.handleWebhook);
    fastify.get('/stats', { preHandler: [authMiddleware, adminMiddleware] }, container.chatController.getStats);
};

export default whatsappRoutes;
