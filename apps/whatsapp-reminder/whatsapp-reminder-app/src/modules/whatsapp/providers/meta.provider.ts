import axios from 'axios';
import CircuitBreaker from 'opossum';
import { env } from '../../../core/config';
import { logger } from '@ingetin/logger';
import { 
    MessagingProvider, 
    SendTextOptions, 
    SendTemplateOptions, 
    MessagingResponse 
} from './messaging.provider';
import { MessagingProviderError, ProviderQuotaExceededError } from '../../../core/errors/DomainErrors';

export class MetaWhatsAppProvider implements MessagingProvider {
    public readonly name = 'META_WHATSAPP';
    private baseUrl = env.META_API_URL;
    private breaker: CircuitBreaker;

    constructor() {
        this.breaker = new CircuitBreaker(this.callMetaApi.bind(this), {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        });

        this.breaker.on('open', () => logger.error(`[${this.name}] Circuit Breaker OPEN`));
        this.breaker.on('halfOpen', () => logger.warn(`[${this.name}] Circuit Breaker HALF_OPEN`));
        this.breaker.on('close', () => logger.info(`[${this.name}] Circuit Breaker CLOSED`));
    }

    getStatus() {
        return {
            name: this.name,
            state: this.breaker.opened ? 'OPEN' : 'CLOSED',
            stats: this.breaker.stats
        };
    }

    private async callMetaApi(url: string, data: any, headers: any) {
        return axios.post(url, data, { headers });
    }

    private getSystemConfig(type: 'otp' | 'notif') {
        if (type === 'otp') {
            return {
                id: env.WA_OTP_PHONE_NUMBER_ID,
                token: env.WA_OTP_ACCESS_TOKEN
            };
        }
        return {
            id: env.WA_NOTIF_PHONE_NUMBER_ID,
            token: env.WA_NOTIF_ACCESS_TOKEN
        };
    }

    async sendText(options: SendTextOptions): Promise<MessagingResponse> {
        const config = this.getSystemConfig(options.type);
        const data = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: options.to,
            type: 'text',
            text: { preview_url: false, body: options.text },
            biz_msg_id: options.idempotencyKey // Meta uses biz_msg_id for deduplication
        };

        return this.execute(config, data);
    }

    async sendTemplate(options: SendTemplateOptions): Promise<MessagingResponse> {
        const config = this.getSystemConfig(options.type);
        const data = {
            messaging_product: 'whatsapp',
            to: options.to,
            type: 'template',
            template: {
                name: options.templateName,
                language: { code: 'en_US' },
                components: options.components && options.components.length > 0 ? [
                    {
                        type: 'body',
                        parameters: options.components.map(text => ({ type: 'text', text }))
                    }
                ] : undefined
            },
            biz_msg_id: options.idempotencyKey
        };

        return this.execute(config, data);
    }

    private async execute(config: { id: string, token: string }, data: Record<string, any>): Promise<MessagingResponse> {
        const url = `${this.baseUrl}/${config.id}/messages`;
        const headers = { 
            Authorization: `Bearer ${config.token}`,
            'Content-Type': 'application/json'
        };

        try {
            // FIRE: Attempt the call through the Circuit Breaker
            const response = await this.breaker.fire(url, data, headers) as { data: { messages: { id: string }[] } };

            return {
                success: true,
                providerMessageId: response.data.messages[0].id,
                rawResponse: response.data
            };
        } catch (error: any) {
            // Check if it's a Circuit Breaker error (Circuit Open)
            if (this.breaker.opened) {
                logger.error({ 
                    msg: `[${this.name}] Circuit Breaker is OPEN. Aborting call.`, 
                    url,
                    recipient: data.to
                });
                return {
                    success: false,
                    error: `Service temporarily unavailable (System Protection Mode)`
                };
            }

            const axiosError = error as { response?: { status?: number, data?: any } };
            const status = axiosError.response?.status;
            const errorData = axiosError.response?.data || (error as Error).message;

            if (status === 429) {
                logger.warn({ msg: `[${this.name}] Quota exceeded`, recipient: data.to });
                return {
                    success: false,
                    error: new ProviderQuotaExceededError(this.name).message
                };
            }

            logger.warn({ 
                msg: `[${this.name}] API call failed`, 
                status, 
                error: errorData,
                recipient: data.to,
                idempotencyKey: data.biz_msg_id
            });

            return {
                success: false,
                error: new MessagingProviderError(
                    typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
                    this.name
                ).message
            };
        }
    }
}
