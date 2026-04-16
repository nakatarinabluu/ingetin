import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '@ingetin/logger';

export const validateBody = (schema: ZodSchema) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const validated = schema.parse(req.body);
            // Replace the body with the validated/parsed version (handles defaults & transforms)
            req.body = validated;
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                logger.warn({
                    msg: 'Validation Failed',
                    path: req.url,
                    errors: error.errors
                });

                reply.status(400).send({
                    success: false,
                    error: 'Validation Error',
                    details: error.errors.map((e) => ({
                        path: e.path,
                        message: e.message
                    }))
                });
            } else {
                logger.warn({ msg: 'Unexpected validation error', path: req.url });
                reply.status(400).send({ success: false, error: 'Validation Error', details: [] });
            }

            // Fastify requires throwing if we want to stop execution in preHandler
            throw new Error('Validation failed');
        }
    };
};
