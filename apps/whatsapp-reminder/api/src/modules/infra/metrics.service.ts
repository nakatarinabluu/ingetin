import { Counter, Histogram, Registry } from 'prom-client';
import { logger } from '@ingetin/logger';

export class MetricsService {
    private registry: Registry;

    // Business Metrics
    public readonly remindersSent: Counter<string>;
    public readonly remindersFailed: Counter<string>;
    public readonly webhooksProcessed: Counter<string>;
    public readonly webhookLatency: Histogram<string>;
    public readonly whatsappMessagesSent: Counter<string>;

    constructor() {
        this.registry = new Registry();

        this.remindersSent = new Counter({
            name: 'whatsapp_reminders_sent_total',
            help: 'Total number of successfully sent reminders',
            labelNames: ['status']
        });

        this.remindersFailed = new Counter({
            name: 'whatsapp_reminders_failed_total',
            help: 'Total number of failed reminder deliveries',
            labelNames: ['reason']
        });

        this.webhooksProcessed = new Counter({
            name: 'whatsapp_webhooks_processed_total',
            help: 'Total number of webhooks processed by the worker',
            labelNames: ['type', 'status']
        });

        this.webhookLatency = new Histogram({
            name: 'whatsapp_webhook_processing_duration_seconds',
            help: 'Time spent processing webhooks in the background',
            buckets: [0.1, 0.5, 1, 2, 5]
        });

        this.whatsappMessagesSent = new Counter({
            name: 'whatsapp_messages_sent_total',
            help: 'Total outgoing WhatsApp messages from the provider',
            labelNames: ['type', 'provider']
        });

        // Register metrics
        this.registry.registerMetric(this.remindersSent);
        this.registry.registerMetric(this.remindersFailed);
        this.registry.registerMetric(this.webhooksProcessed);
        this.registry.registerMetric(this.webhookLatency);
        this.registry.registerMetric(this.whatsappMessagesSent);

        logger.info('Metrics Service: Silicon Valley Observability initialized');
    }

    getRegistry() {
        return this.registry;
    }
}

export const metricsService = new MetricsService();
