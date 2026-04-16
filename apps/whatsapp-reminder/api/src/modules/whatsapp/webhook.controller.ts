import { FastifyRequest, FastifyReply, RouteHandler, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifySchema, RouteGenericInterface } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { logger } from '@ingetin/logger';
import { env } from '../../core/config';
import crypto from 'crypto';
import { RedisService } from '../infra/redis.service';
import { WhatsAppService } from './whatsapp.service';
import { formatPhone } from '../../utils/phoneFormatter';
import { WebhookPayload } from '@ingetin/types';

type TypedHandler<T extends RouteGenericInterface = RouteGenericInterface> = RouteHandler<
    T, 
    RawServerDefault, 
    RawRequestDefaultExpression, 
    RawReplyDefaultExpression, 
    any, 
    FastifySchema, 
    ZodTypeProvider
>;

export class WebhookController {
    private readonly CHANNEL = 'live_monitoring';

    constructor(
        private readonly redisService: RedisService,
        private readonly whatsappService: WhatsAppService
    ) {}

    /**
     * Verify X-Hub-Signature-256 from Meta
     */
    private verifySignature = (req: FastifyRequest): boolean => {
        const signature = req.headers['x-hub-signature-256'];
        
        // Skip verification in development to ease testing
        if (process.env.NODE_ENV === 'development') {
            return true;
        }

        if (!signature || typeof signature !== 'string') return false;

        const [algo, hash] = signature.split('=');
        if (algo !== 'sha256') return false;

        const expectedHash = crypto.createHmac('sha256', env.WA_APP_SECRET)
            .update(req.rawBody || '')
            .digest('hex');

        try {
            const hashBuffer = Buffer.from(hash || '');
            const expectedHashBuffer = Buffer.from(expectedHash || '');
            if (hashBuffer.length !== expectedHashBuffer.length) return false;
            return crypto.timingSafeEqual(hashBuffer, expectedHashBuffer);
        } catch (error) {
            return false;
        }
    };

    /**
     * Send a direct notification (Internal API)
     */
    sendNotification: TypedHandler<{ Body: { phone: string; message: string; template?: string; params?: string[] } }> = async (req, reply) => {
        const { id: userId } = req.user!;
        const phone = formatPhone(req.body.phone);

        const result = await this.whatsappService.sendNotification(userId, phone, req.body.message, req.body.template, req.body.params);
        return reply.send({ success: result.success, error: result.success ? undefined : result.error });
    };

    /**
     * Meta Webhook verification (GET request)
     */
    verifyWebhook: TypedHandler<{ Querystring: { 'hub.mode'?: string; 'hub.verify_token'?: string; 'hub.challenge'?: string; } }> = (req, reply) => {
        const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
        
        if (mode === 'subscribe' && token === env.WA_VERIFY_TOKEN) {
            reply.type('text/plain');
            return reply.send(challenge);
        }
        return reply.status(403).send();
    };

    /**
     * Meta Webhook handler (POST request)
     */
    handleWebhook: TypedHandler<{ Body: WebhookPayload }> = async (req, reply) => {
        if (!this.verifySignature(req)) {
            logger.warn({ msg: 'Webhook signature verification failed', headers: req.headers });
            return reply.status(401).send();
        }

        try {
            // Queue the raw payload for background processing to avoid Meta timeout (10s)
            // But for now, we process it synchronously for simplicity in small scale
            await this.whatsappService.handleIncomingWebhook(req.body);
            
            return reply.status(200).send({ status: 'ACKNOWLEDGED' });
        } catch (error: unknown) {
            logger.error({ msg: 'Webhook processing failed', error: ((error as Error).message) });
            return reply.status(200).send();
        }
    };
}
