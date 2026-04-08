import { logger } from '@ingetin/logger';

/**
 * Ingetin Monolith Instrumentation
 * 
 * Heavy monitoring (OpenTelemetry, Sentry Profiling) has been removed 
 * to ensure the app remains lean and stable on a 2GB RAM VPS.
 */
logger.info('Instrumentation: All Heavy Monitoring (OTel/Sentry) is currently DISABLED for performance.');
