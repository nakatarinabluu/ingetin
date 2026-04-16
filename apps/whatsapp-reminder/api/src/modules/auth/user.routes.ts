import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth';
import { GenerateLicenseSchema } from '@ingetin/types';

const userRoutes: FastifyPluginAsync = async (fastify, opts) => {
    const { di } = fastify;
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

    // 1. Private Profile
    typedFastify.get('/profile', { preHandler: [authMiddleware] }, di.userController.getProfile);

    // 2. Admin: User Management
    typedFastify.get('/', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.getAllUsers);
    typedFastify.delete('/:id', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.deleteUser);
    typedFastify.delete('/:id/reminders', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.clearUserReminders);

    // 3. Admin: License Management (Consolidated here)
    typedFastify.get('/licenses', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.getAllLicenses);
    typedFastify.post('/licenses/generate', { 
        preHandler: [authMiddleware, adminMiddleware],
        schema: { body: GenerateLicenseSchema }
    }, di.userController.generateLicense);
    typedFastify.post('/licenses/:id/pause', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.pauseLicense);
    typedFastify.post('/licenses/:id/unpause', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.unpauseLicense);
    typedFastify.post('/licenses/:id/revoke', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.revokeLicense);
    typedFastify.delete('/licenses/:id', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.revokeLicense); // Keep DELETE for backward compatibility

    // 4. Admin: Audit Toolkit
    typedFastify.get('/:id/details', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.getUserFullDetails);
    typedFastify.get('/:id/reminders', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.getUserReminders);
    typedFastify.post('/:id/sync/deep', { preHandler: [authMiddleware, adminMiddleware] }, di.userController.triggerDeepSync);
};

export default userRoutes;
