import { FastifyReply } from 'fastify';
import { OTPService } from './otp.service';
import { UserRepository } from '../auth/user.repository';
import { formatPhone } from '../../utils/phoneFormatter';
import { logger } from '@ingetin/logger';
import { BadRequestError } from '../../core/errors/AppError';
import { AuthRequest } from '../../middlewares/auth';
import { OTPSendInput, OTPVerifyInput } from '@ingetin/types';

interface PhoneHistoryEntry {
    old: string;
    new: string;
    at: Date;
    action: string;
}

export class OTPController {
    constructor(
        private readonly otpService: OTPService,
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Send an OTP to the user's phone for verification
     */
    sendOTP = async (req: AuthRequest, reply: FastifyReply) => {
        const validatedData = req.body as OTPSendInput;
        const { id: userId } = req.user!;
        const phone = formatPhone(validatedData.phone);
        
        await this.otpService.sendOTP(phone, userId);
        return { message: 'OTP sent successfully' };
    };

    /**
     * Verify the OTP and link the phone number to the user's account
     */
    verifyOTP = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const validatedData = req.body as OTPVerifyInput;
        const phone = formatPhone(validatedData.phone);

        const isValid = await this.otpService.verifyOTP(phone, validatedData.code);
        
        if (!isValid) {
            throw new BadRequestError('Invalid or expired verification code');
        }

        const currentUser = await this.userRepository.findById(userId);
        
        if (currentUser?.phoneNumber !== phone) {
        }

        await this.userRepository.update(userId, { 
            phoneNumber: phone
        });

        // Invalidate setup/linked cache
        await this.otpService.clearUserCache(userId);

        logger.info({ msg: 'WhatsApp linked successfully', userId, phone });
        return { message: 'WhatsApp linked successfully' };
    };
}
