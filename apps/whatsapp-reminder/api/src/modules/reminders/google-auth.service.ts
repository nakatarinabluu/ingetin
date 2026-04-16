import { google } from 'googleapis';
import crypto from 'crypto';
import { logger } from '@ingetin/logger';
import { RedisService } from '../infra/redis.service';
import { GoogleCalendarProvider } from '../reminders/google-calendar.provider';
import { CalendarRepository } from '../reminders/calendar.repository';
import { Result, Success, Failure } from '../../core/result';
import { ErrorCode } from '../../core/errors/AppError';

export class GoogleAuthService {
    constructor(
        private readonly repository: CalendarRepository,
        private readonly redisService: RedisService,
        private readonly googleProvider: GoogleCalendarProvider
    ) {}

    async getAuthUrl(userId: string): Promise<string> {
        const client = this.googleProvider.getClient();
        const state = crypto.randomUUID();
        
        // Store state in Redis with a 10-minute expiry
        await this.redisService.setOTP(`oauth_state:${state}`, userId, 600);

        logger.info({ msg: 'Generating Google Auth URL', userId, state });        
        return client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            state,
            prompt: 'consent'
        });
    }

    async validateState(state: string): Promise<string | null> {
        const userId = await this.redisService.getOTP(`oauth_state:${state}`);
        if (userId) {
            await this.redisService.deleteOTP(`oauth_state:${state}`);
        }
        return userId;
    }

    async handleCallback(code: string, userId: string): Promise<Result<void>> {
        try {
            const client = this.googleProvider.getClient();
            const { tokens } = await client.getToken(code);
            client.setCredentials(tokens);

            const oauth2 = google.oauth2({ version: 'v2', auth: client });
            const userInfo = await oauth2.userinfo.get();
            const googleEmail = userInfo.data.email;

            const user = await this.repository.findUserById(userId);
            if (!user) return Failure('User not found', ErrorCode.NOT_FOUND);

            if (!googleEmail || googleEmail.toLowerCase() !== user.email?.toLowerCase()) {
                logger.warn({ msg: 'Google Link Rejected: Email mismatch', userId, expected: user.email, received: googleEmail });
                return Failure(`Email mismatch. Please connect using ${user.email}`, ErrorCode.FORBIDDEN);
            }

            await this.repository.updateUserTokens(userId, {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date,
                scope: tokens.scope,
                token_type: tokens.token_type
            });
            
            await this.redisService.deleteCache(`setup:${userId}`);
            
            logger.info({ msg: 'Google account linked successfully', userId, email: googleEmail });
            return Success(undefined);
        } catch (error: unknown) {
            logger.error({ msg: 'Google Auth Callback Failed', userId, error: (error as Error).message });
            return Failure('Failed to connect Google account', ErrorCode.INTERNAL_ERROR);
        }
    }
}
