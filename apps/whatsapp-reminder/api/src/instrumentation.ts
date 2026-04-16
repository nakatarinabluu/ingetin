import * as Sentry from '@sentry/node';
import { logger } from '@ingetin/logger';

/**
 * Ingetin Monolith Instrumentation
 * 
 * Optimized for 2GB RAM VPS:
 * - Traces Sample Rate: 0.1 (Only 10% of requests are traced)
 * - Profiling: DISABLED (Uninstalled to save CPU/RAM and avoid type conflicts)
 */
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        // Performance Monitoring
        tracesSampleRate: 0.1,
        environment: process.env.NODE_ENV,
    });
    logger.info('Instrumentation: Sentry Error Tracking ENABLED (Lean Mode)');
} else {
    logger.info('Instrumentation: Sentry DISABLED (Dev Mode or Missing DSN)');
}
