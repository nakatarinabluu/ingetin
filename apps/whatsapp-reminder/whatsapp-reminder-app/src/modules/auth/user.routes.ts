import { FastifyPluginAsync } from 'fastify';
import { container } from '../../core/container';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth';

const userRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // 1. Private Profile
    fastify.get('/profile', { preHandler: [authMiddleware] }, container.userController.getProfile);

    // 2. Admin: User Management
    fastify.get('/', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.getAllUsers);
    fastify.delete('/:id', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.deleteUser);
    fastify.delete('/:id/reminders', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.clearUserReminders);

    // 3. Admin: License Management (Consolidated here)
    fastify.get('/licenses', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.getAllLicenses);
    fastify.post('/licenses/generate', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.generateLicense);
    fastify.post('/licenses/:id/pause', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.pauseLicense);
    fastify.post('/licenses/:id/unpause', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.unpauseLicense);
    fastify.post('/licenses/:id/revoke', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.revokeLicense);
    fastify.delete('/licenses/:id', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.revokeLicense); // Keep DELETE for backward compatibility

    // 4. Admin: Audit Toolkit
    fastify.get('/:id/details', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.getUserFullDetails);
    fastify.get('/:id/reminders', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.getUserReminders);
    fastify.post('/:id/sync/deep', { preHandler: [authMiddleware, adminMiddleware] }, container.userController.triggerDeepSync);
};

export default userRoutes;
