import { FastifyReply, FastifyRequest, RouteHandler, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifySchema, RouteGenericInterface } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { OTPService } from './otp.service';
import { UserService } from '../auth/user.service';
import { formatPhone } from '../../utils/phoneFormatter';
import { logger } from '@ingetin/logger';
import { BadRequestError } from '../../core/errors/AppError';
import { OTPSendInput, OTPVerifyInput } from '@ingetin/types';

type TypedHandler<T extends RouteGenericInterface = RouteGenericInterface> = RouteHandler<
    T, 
    RawServerDefault, 
    RawRequestDefaultExpression, 
    RawReplyDefaultExpression, 
    any, 
    FastifySchema, 
    ZodTypeProvider
>;

export class OTPController {
    constructor(
        private readonly otpService: OTPService,
        private readonly userService: UserService
    ) {}

    /**
     * Send an OTP to the user's phone for verification
     */
    sendOTP: TypedHandler<{ Body: OTPSendInput }> = async (req, reply) => {
        const { id: userId } = req.user!;
        const phone = formatPhone(req.body.phone);
        
        await this.otpService.sendOTP(phone, userId);
        return reply.send({ success: true, message: 'OTP sent successfully' });
    };

    /**
     * Verify the OTP and link the phone number to the user's account
     */
    verifyOTP: TypedHandler<{ Body: OTPVerifyInput }> = async (req, reply) => {
        const userId = req.user!.id;
        const phone = formatPhone(req.body.phone);

        const isValid = await this.otpService.verifyOTP(phone, req.body.code);
        
        if (!isValid) {
            throw new BadRequestError('Invalid or expired verification code');
        }

        const result = await this.userService.linkWhatsApp(userId, phone);
        if (!result.success) {
            throw new BadRequestError(result.error || 'Failed to link account');
        }

        // Invalidate setup/linked cache
        await this.otpService.clearUserCache(userId);

        logger.info({ msg: 'WhatsApp linked successfully', userId, phone });
        return reply.send({ success: true, message: 'WhatsApp linked successfully' });
    };
}
