import { FastifyPluginAsync } from 'fastify';
import { authMiddleware, licenseMiddleware } from '../../middlewares/auth';

const financeRoutes: FastifyPluginAsync = async (fastify) => {
    const { di } = fastify;
    const controller = di.financeController;

    // All finance routes require authentication and an active license
    fastify.addHook('preHandler', authMiddleware);
    fastify.addHook('preHandler', licenseMiddleware);

    fastify.get('/summary', controller.getSummary);
    fastify.get('/transactions', controller.getTransactions);
    fastify.post('/profile', controller.updateProfile);
};

export default financeRoutes;
