import crypto from 'crypto';
import { RedisService } from '../infra/redis.service';
import { WhatsAppService } from './whatsapp.service';
import { UsageService, UsageType } from '../infra/usage.service';
import { logger } from '@ingetin/logger';
import { TemplateService, TemplateType } from './template.service';
import { BadRequestError, RateLimitError } from '../../core/errors/AppError';

export class OTPService {
    private EXPIRE_TIME = 300; // 5 minutes

    constructor(
        private readonly redisService: RedisService,
        private readonly whatsappService: WhatsAppService,
        private readonly templateService: TemplateService,
        private readonly usageService: UsageService
    ) {}

    /**
     * Generate and send a 6-digit OTP
     */
    async sendOTP(phone: string, userId?: string): Promise<boolean> {
        // 1. Check cooling period (1 min)
        const isCooling = await this.redisService.isCooling(phone);
        if (isCooling) {
            throw new RateLimitError('Please wait 60 seconds before requesting another code.');
        }

        try {
            const otp = crypto.randomInt(100000, 999999).toString();
            
            // 2. Store in Redis
            await this.redisService.setOTP(phone, otp);
            await this.redisService.setCooling(phone, 60); // 1 minute cooling
            
            // 3. Format Message (Keep for logging/fallback)
            const message = this.templateService.format(TemplateType.OTP, { otp });

            // 4. Send via WhatsApp Service using Template for high reliability
            // Most Meta accounts require a Template for the first message (24h window)
            const result = await this.whatsappService.sendTemplate(
                'otp', 
                phone, 
                'auth_otp', // Assuming you have a template named auth_otp or similar
                [otp], 
                userId
            );
            
            if (result.success) {
                await this.usageService.logUsage(userId || 'SYSTEM', UsageType.OTP_SENT, phone, 'SUCCESS');
                logger.info({ msg: 'OTP delivered', phone });
                return true;
            } else {
                throw new Error(result.error || 'Delivery failed at provider level');
            }
        } catch (error: unknown) {
            if (error instanceof RateLimitError) throw error;
            
            logger.error({ msg: 'Failed to send OTP', phone, error: ((error as Error).message) });
            throw new Error(`Failed to deliver OTP message: ${((error as Error).message)}`);
        }
    }

    /**
     * Verify the code provided by user
     */
    async verifyOTP(phone: string, userCode: string): Promise<boolean> {
        const storedCode = await this.redisService.getOTP(phone);
        
        if (!storedCode) return false;
        
        if (storedCode === userCode) {
            await this.redisService.deleteOTP(phone);
            return true;
        }
        
        return false;
    }

    /**
     * Clear user setup/linked caches
     */
    async clearUserCache(userId: string): Promise<void> {
        await this.redisService.deleteCache(`linked:${userId}`);
        await this.redisService.deleteCache(`setup:${userId}`);
    }
}
