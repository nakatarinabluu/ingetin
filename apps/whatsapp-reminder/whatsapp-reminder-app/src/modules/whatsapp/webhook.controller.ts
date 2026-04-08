import { FastifyRequest, FastifyReply } from 'fastify';
import { WhatsAppService } from './whatsapp.service';
import { formatPhone } from '../../utils/phoneFormatter';
import { logger } from '@ingetin/logger';
import { env } from '../../core/config';
import crypto from 'crypto';
import { z } from 'zod';
import { MessageRepository } from './message.repository';
import { UserRepository } from '../auth/user.repository';
import { AuthRequest } from '../../middlewares/auth';
import { webhookQueue } from './webhook.queue';
import { WebhookPayloadSchema } from '@ingetin/types';


export class WebhookController {
    constructor(
        private readonly whatsappService: WhatsAppService,
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Verify X-Hub-Signature-256 from Meta
     */
    private verifySignature = (req: FastifyRequest): boolean => {
        const signature = req.headers['x-hub-signature-256'] as string;
        
        // Skip verification in development to ease testing
        if (process.env.NODE_ENV === 'development') {
            return true;
        }

        if (!signature) return false;

        const [algo, hash] = signature.split('=');
        if (algo !== 'sha256') return false;

        const expectedHash = crypto.createHmac('sha256', env.WA_APP_SECRET)
            .update((req as any).rawBody || '') // rawBody added by fastify-raw-body plugin
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
    sendNotification = async (req: AuthRequest, reply: FastifyReply) => {
        const { id: userId } = req.user!;
        const body = req.body as { phone: string; message: string; template?: string; params?: any[] };
        const phone = formatPhone(body.phone);

        const result = await this.whatsappService.sendNotification(userId, phone, body.message, body.template, body.params);
        return { success: result.success, error: result.success ? undefined : result.error };
    };

    /**
     * Meta Webhook verification (GET request)
     */
    verifyWebhook = (req: FastifyRequest, reply: FastifyReply) => {
        const query = req.query as { 
            'hub.mode'?: string; 
            'hub.verify_token'?: string; 
            'hub.challenge'?: string; 
        };
        
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        
        if (mode === 'subscribe' && token === env.WA_VERIFY_TOKEN) {
            reply.type('text/plain');
            return challenge;
        }
        reply.status(403).send();
    };

    /**
     * Handle incoming Meta Webhook events (POST request)
     * Acknowledge immediately, process asynchronously.
     */
    handleWebhook = async (req: FastifyRequest, reply: FastifyReply) => {
        if (!this.verifySignature(req)) return reply.status(401).send();

        try {
            const rawBody = WebhookPayloadSchema.parse(req.body);
            
            // Push to BullMQ for background processing
            // Add timestamp to jobId to prevent collision on high-speed bursts
            const bodyHash = crypto.createHash('md5').update(JSON.stringify(rawBody)).digest('hex');
            const uniqueId = `webhook_${bodyHash}_${Date.now()}_${process.hrtime()[1]}`;

            await webhookQueue.add('whatsapp-incoming', rawBody, {
                jobId: uniqueId
            });

            // Return 200 OK immediately to Meta
            return reply.status(200).send({ status: 'ACKNOWLEDGED' });
        } catch (error: any) {
            logger.error({ msg: 'Webhook queueing failed', error: ((error as Error).message) });
            return reply.status(200).send();
        }
    };
}

