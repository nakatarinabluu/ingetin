import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware, licenseMiddleware, setupMiddleware } from '../../middlewares/auth';
import { ReminderSchema } from '@ingetin/types';

const reminderRoutes: FastifyPluginAsync = async (fastify) => {
    const { di } = fastify;
    const controller = di.reminderController;
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

    // Apply global middleware for all reminder routes
    fastify.addHook('preHandler', authMiddleware);
    fastify.addHook('preHandler', licenseMiddleware);
    fastify.addHook('preHandler', setupMiddleware);

    typedFastify.get('/', controller.getReminders);
    typedFastify.post('/', { schema: { body: ReminderSchema } }, controller.createReminder);
    typedFastify.post('/sync', controller.syncReminders);
    typedFastify.delete('/:id', controller.deleteReminder);
};

export default reminderRoutes;
