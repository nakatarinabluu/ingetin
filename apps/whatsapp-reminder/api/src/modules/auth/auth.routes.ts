import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '../../middlewares/auth';
import { 
    LoginSchema, 
    RegisterSchema, 
    ActivateLicenseSchema, 
    UpdateProfileSchema 
} from '@ingetin/types';

const authRoutes: FastifyPluginAsync = async (fastify, opts) => {
    const { di } = fastify;
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
    
    // --- CSRF Token Generation ---
    typedFastify.get('/csrf', async (request, reply) => {
        const token = await reply.generateCsrf();
        return reply.send({ token });
    });

    // --- Authentication ---
    typedFastify.get('/check-username', di.authController.checkUsername);
    typedFastify.post('/register', { 
        schema: { body: RegisterSchema },
        onRequest: fastify.csrfProtection
    }, di.authController.register);
    
    typedFastify.post('/login', { 
        schema: { body: LoginSchema },
        onRequest: fastify.csrfProtection,
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute'
            }
        }
    }, di.authController.login);

    typedFastify.post('/refresh', di.authController.refreshToken);

    typedFastify.post('/logout', { 
        preHandler: [authMiddleware] 
    }, di.authController.logout);

    // --- Profile & Activation ---
    typedFastify.post('/activate', { 
        preHandler: [authMiddleware],
        schema: { body: ActivateLicenseSchema }
    }, di.authController.activateLicense);
    
    typedFastify.post('/update-profile', { 
        preHandler: [authMiddleware],
        schema: { body: UpdateProfileSchema }
    }, di.authController.updateProfile);

    // --- Social & Phone Unlinking ---
    typedFastify.post('/google/unlink', { preHandler: [authMiddleware] }, di.authController.unlinkGoogle);
    typedFastify.post('/otp/unlink', { preHandler: [authMiddleware] }, di.authController.unlinkPhone);

    // --- Google Calendar Integration ---
    typedFastify.get('/google', { preHandler: [authMiddleware] }, di.authController.redirectToGoogle);
    typedFastify.get('/google/callback', di.authController.handleGoogleCallback);
};

export default authRoutes;
