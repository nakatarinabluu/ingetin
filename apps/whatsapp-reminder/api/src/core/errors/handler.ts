import { FastifyInstance } from 'fastify';
import { logger } from '@ingetin/logger';
import { AppError } from './AppError';

/** Shape of Fastify's internal validation error object */
interface FastifyValidationError extends Error {
    validation?: Array<{ message: string; params?: Record<string, unknown> }>;
    statusCode?: number;
}

export function setErrorHandler(fastify: FastifyInstance) {
    fastify.setErrorHandler((error: unknown, request, reply) => {
        const requestId = request.id;

        // Custom Operational Errors
        if (error instanceof AppError) {
            logger.warn({ msg: 'Operational Error', code: error.code, message: error.message, requestId });
            return reply.status(error.statusCode).send({
                success: false,
                data: null,
                error: error.message,
                errorCode: error.code,
                requestId
            });
        }

        // Fastify/Zod Validation Errors
        const err = error as FastifyValidationError;

        if (err.validation) {
            logger.warn({ msg: 'Validation Error', path: request.url, validation: err.validation, requestId });
            return reply.status(400).send({
                success: false,
                data: null,
                error: 'Validation failed',
                errorCode: 'VALIDATION_ERROR',
                details: err.validation,
                requestId
            });
        }

        // Unhandled Exceptions
        const statusCode = err.statusCode || 500;

        if (statusCode !== 500) {
            logger.warn({ msg: 'Request Error', statusCode, error: err.message, requestId });
            return reply.status(statusCode).send(err);
        }

        logger.error({
            msg: 'Unhandled Exception',
            error: err.message || 'No message',
            requestId,
            stack: err.stack || 'No stack'
        });

        reply.status(500).send({
            success: false,
            data: null,
            error: 'Internal Server Error',
            message: err.message || 'An unexpected error occurred.',
            errorCode: 'INTERNAL_SERVER_ERROR',
            requestId
        });
    });
}
