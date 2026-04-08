import pino from 'pino';

// Pretty printing for development
const transport = process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
        },
    }
    : undefined;

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
        paths: [
            'password', 
            '*.password', 
            'token', 
            '*.token', 
            'secret', 
            '*.secret', 
            'key', 
            '*.key', 
            'googleAccessToken', 
            'googleRefreshToken'
        ],
        censor: '[REDACTED]'
    },
    transport,
    base: {
        pid: process.pid,
    },
});

export type Logger = typeof logger;
