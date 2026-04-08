import { FastifyPluginAsync } from 'fastify';
import { container } from '../../core/container';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { logger } from '@ingetin/logger';
import { env } from '../../core/config';
import { 
    LoginSchema, 
    RegisterSchema, 
    ActivateLicenseSchema, 
    UpdateProfileSchema 
} from '@ingetin/types';

const authRoutes: FastifyPluginAsync = async (fastify, opts) => {
    
    // --- CSRF Token Generation ---
    fastify.get('/csrf', async (request, reply) => {
        const token = await reply.generateCsrf();
        return reply.send({ token });
    });

    // --- Authentication ---
    fastify.get('/check-username', container.authController.checkUsername);
    fastify.post('/register', { 
        schema: { body: RegisterSchema },
        onRequest: fastify.csrfProtection
    }, container.authController.register);
    
    fastify.post('/login', { 
        schema: { body: LoginSchema },
        onRequest: fastify.csrfProtection,
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute'
            }
        }
    }, container.authController.login);

    fastify.post('/logout', { 
        preHandler: [authMiddleware] 
    }, container.authController.logout);

    // --- Profile & Activation ---
    fastify.post('/activate', { 
        preHandler: [authMiddleware],
        schema: { body: ActivateLicenseSchema }
    }, container.authController.activateLicense);
    
    fastify.post('/update-profile', { 
        preHandler: [authMiddleware],
        schema: { body: UpdateProfileSchema }
    }, container.authController.updateProfile);

    // --- Social & Phone Unlinking ---
    fastify.post('/google/unlink', { preHandler: [authMiddleware] }, container.authController.unlinkGoogle);
    fastify.post('/otp/unlink', { preHandler: [authMiddleware] }, container.authController.unlinkPhone);

    // --- Google Calendar Integration ---
    fastify.get('/google', { preHandler: [authMiddleware] }, async (request: AuthRequest, reply: any) => {
        const userId = request.user!.id;
        const url = container.calendarService.getAuthUrl(userId);
        return reply.redirect(url);
    });

    fastify.get('/google/callback', async (request: any, reply: any) => {
        logger.info({ msg: 'Received Google Callback', query: { state: request.query.state, hasCode: !!request.query.code }, url: request.url });
        const { code, state } = request.query;

        try {
            if (!state) throw new Error('OAuth state missing');
            const userId = await container.calendarService.validateState(state);
            
            if (!userId) {
                logger.warn({ msg: 'Google Auth: Invalid or expired state', state });
                throw new Error('Invalid or expired authentication session');
            }

            await container.calendarService.handleCallback(code, userId);
            const frontendUrl = env.FRONTEND_URL;
            return reply.redirect(`${frontendUrl}/dashboard?calendar=success`);
        } catch (error: any) {
            logger.error({ msg: 'Google Auth Error', error: ((error as Error).message) });
            const frontendUrl = env.FRONTEND_URL;
            return reply.redirect(`${frontendUrl}/dashboard?calendar=((error as Error).message)=${encodeURIComponent(((error as Error).message))}`);
        }
    });
};

export default authRoutes;
