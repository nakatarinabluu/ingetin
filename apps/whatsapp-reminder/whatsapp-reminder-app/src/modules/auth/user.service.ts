import argon2 from 'argon2';
import { logger } from '@ingetin/logger';
import { UserRepository } from './user.repository';
import { Success, Failure, Result } from '../../core/result';
import { RedisService } from '../infra/redis.service';
import { BadRequestError } from '../../core/errors/AppError';
import { UpdateProfileInput } from '@ingetin/types';

interface HistoryEntry {
    old: string | null;
    new: string | null;
    at: Date;
    action?: string;
}

import { EncryptionService } from '../infra/encryption.service';

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly encryptionService: EncryptionService
    ) {}

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: UpdateProfileInput): Promise<Result<any>> {
        try {
            const currentUser = await this.userRepository.findById(userId);
            if (!currentUser) throw new BadRequestError('User not found');

            const updateData: Record<string, string | null | undefined> = {};

            if (data.phoneNumber !== undefined) {
                const newPhone = data.phoneNumber ? data.phoneNumber : null;
                const encryptedPhone = this.encryptionService.encryptField(newPhone);
                const phoneHash = this.encryptionService.generateBlindIndex(newPhone);
                
                if (encryptedPhone !== currentUser.phoneNumber) {
                    updateData.phoneNumber = encryptedPhone;
                    updateData.phoneHash = phoneHash;
                }
            }

            if (data.email !== undefined) {
                const newEmail = data.email ? data.email.toLowerCase() : null;
                const encryptedEmail = this.encryptionService.encryptField(newEmail);
                const emailHash = this.encryptionService.generateBlindIndex(newEmail);

                if (encryptedEmail !== currentUser.email) {
                    updateData.email = encryptedEmail;
                    updateData.emailHash = emailHash;
                    
                    // Note: In a real system, changing email should invalidate tokens
                    // For the new SocialAccount schema, we would manually delete or invalidate social accounts here if needed
                }
            }

            if (data.firstName !== undefined) updateData.firstName = data.firstName;
            if (data.lastName !== undefined) updateData.lastName = data.lastName;

            if (data.password) {
                updateData.password = await argon2.hash(data.password);
            }

            await this.userRepository.update(userId, updateData);
            
            // Invalidate linked/setup and profile cache
            await this.redisService.deleteCache(`linked:${userId}`);
            await this.redisService.deleteCache(`setup:${userId}`);
            await this.redisService.deleteCache(`user:profile:${userId}`);

            return Success({ message: 'Profile updated' });
        } catch (error: any) {
            if (error instanceof BadRequestError) throw error;
            return Failure(((error as Error).message));
        }
    }

    /**
     * Unlink Google Account
     */
    async unlinkGoogle(userId: string): Promise<Result<any>> {
        logger.info({ msg: 'UserService: Attempting to unlink Google', userId });
        try {
            const user = await this.userRepository.findById(userId);
            if (user) {
                
                // Directly delete the GOOGLE social account record
                await this.userRepository.prismaDb.socialAccount.deleteMany({
                    where: { userId, provider: 'GOOGLE' }
                });

                // Invalidate setup and profile cache
                await this.redisService.deleteCache(`setup:${userId}`);
                await this.redisService.deleteCache(`user:profile:${userId}`);
                logger.info({ msg: 'UserService: Google unlinked successfully', userId });
            }
            return Success({ message: 'Google account unlinked' });
        } catch (error: any) {
            logger.error({ msg: 'UserService UnlinkGoogle Error', userId, error: ((error as Error).message) });
            return Failure('Unlink failed');
        }
    }

    /**
     * Unlink WhatsApp Phone
     */
    async unlinkPhone(userId: string): Promise<Result<any>> {
        try {
            const user = await this.userRepository.findById(userId);
            if (user) {

                await this.userRepository.update(userId, { 
                    phoneNumber: null
                });

                // Invalidate linked/setup and profile cache
                await this.redisService.deleteCache(`linked:${userId}`);
                await this.redisService.deleteCache(`setup:${userId}`);
                await this.redisService.deleteCache(`user:profile:${userId}`);
            }
            return Success({ message: 'Phone number unlinked' });
        } catch (error: any) {
            logger.error({ msg: 'UserService UnlinkPhone Error', userId, error: ((error as Error).message) });
            return Failure('Unlink failed');
        }
    }
}
