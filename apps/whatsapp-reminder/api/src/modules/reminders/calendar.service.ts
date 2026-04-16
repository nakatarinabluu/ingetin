import { calendar_v3 } from 'googleapis';
import { logger } from '@ingetin/logger';
import { DateUtils } from '../../utils/dateUtils';
import { env } from '../../core/config';
import { CalendarRepository } from './calendar.repository';
import { RedisService } from '../infra/redis.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { Result, Success, Failure } from '../../core/result';
import { ErrorCode } from '../../core/errors/AppError';
import { ReminderStatus, RepeatInterval, Prisma } from '@prisma/client';
import { decrypt, isEncrypted } from '../../utils/crypto';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { calendarQueue } from './calendar.queue';

export class CalendarService {
    constructor(
        private readonly repository: CalendarRepository,
        private readonly redisService: RedisService,
        private readonly whatsappService: WhatsAppService,
        private readonly googleProvider: GoogleCalendarProvider
    ) {}

    getStatus() {
        return this.googleProvider.getStatus();
    }

    /**
     * Trigger background sync for all active users
     */
    async syncAllUserEvents(): Promise<void> {
        const users = await this.repository.findActiveUsersWithGoogle();
        logger.info({ msg: 'Queueing background Calendar sync', count: users.length });

        for (const user of users) {
            try {
                await calendarQueue.add('sync-user-calendar', { 
                    userId: user.id 
                }, {
                    jobId: `sync:${user.id}:${new Date().toISOString().split('T')[0]}`,
                    removeOnComplete: true
                });
            } catch (error: unknown) {
                logger.error({ msg: 'Failed to queue user calendar sync', userId: user.id, error: (error as Error).message });
            }
        }
    }

    /**
     * Perform immediate sync for a single user
     */
    async syncUserEvents(userId: string): Promise<Result<void>> {
        const lockKey = `sync:lock:${userId}`;
        const isLocked = await this.redisService.acquireLock(lockKey, 300);
        
        if (!isLocked) {
            logger.warn({ msg: 'Sync Aborted: Process already running for user', userId });
            return Success(undefined);
        }

        try {
            logger.info({ msg: 'Manual Sync: Initializing for user', userId });
            const user = await this.repository.findUserById(userId);
            if (!user) return Failure('User not found', ErrorCode.NOT_FOUND);
            
            const googleAccount = user.socialAccounts?.find((a) => a.provider === 'GOOGLE');

            if (!googleAccount?.refreshToken) {
                return this.handleMissingTokens(userId, user.phoneNumber);
            }

            const accessToken = this.resolveToken(googleAccount.accessToken);
            const refreshToken = this.resolveToken(googleAccount.refreshToken);

            const auth = this.googleProvider.getClient({
                access_token: accessToken ?? undefined,
                refresh_token: refreshToken ?? undefined,
                expiry_date: googleAccount.expiresAt?.getTime()
            });

            auth.on('tokens', (tokens) => {
                this.repository.updateUserTokens(userId, {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token || refreshToken,
                    expiry_date: tokens.expiry_date,
                    scope: tokens.scope,
                    token_type: tokens.token_type
                });
                logger.info({ msg: 'Google Tokens Rotated/Updated', userId });
            });

            const now = new Date();
            const startOfSync = new Date(now);
            startOfSync.setDate(startOfSync.getDate() - 7);

            const endRange = new Date(now);
            endRange.setDate(endRange.getDate() + 365);

            const data = await this.googleProvider.listEvents(auth, startOfSync, endRange).catch(err => {
                if (err.message === 'invalid_grant') {
                    throw new Error(ErrorCode.GOOGLE_AUTH_EXPIRED);
                }
                throw err;
            });

            const items = data.items || [];
            logger.info({ msg: 'Unique Google Items Found', count: items.length, userId });
            
            for (const event of items) {
                try {
                    const cacheKey = `cal_etag:${userId}:${event.id}`;
                    const lastEtag = await this.redisService.getCache(cacheKey);
                    
                    if (lastEtag === event.etag) continue;

                    await this.processEventInternal(userId, event);
                    
                    if (event.etag) {
                        await this.redisService.setCache(cacheKey, event.etag, 24 * 60 * 60);
                    }
                } catch (err: unknown) {
                    logger.error({ msg: 'Failed to process calendar event', eventId: event.id, error: (err as Error).message });
                }
            }
            
            return Success(undefined);
        } catch (error: unknown) {
            if ((error as Error).message === ErrorCode.GOOGLE_AUTH_EXPIRED) {
                return Failure('Google authentication expired', ErrorCode.GOOGLE_AUTH_EXPIRED);
            }
            return Failure('Calendar sync failed', ErrorCode.CALENDAR_SYNC_FAILED);
        } finally {
            await this.redisService.releaseLock(lockKey);
        }
    }

    /**
     * Sync user events from the last 30 days (Historical)
     */
    async syncUserEventsHistorical(userId: string): Promise<{ count: number }> {
        try {
            const user = await this.repository.findUserById(userId);
            if (!user) throw new Error('User not found');
            
            const googleAccount = user.socialAccounts?.find((a) => a.provider === 'GOOGLE');
            if (!googleAccount?.refreshToken) return { count: 0 };

            const accessToken = this.resolveToken(googleAccount.accessToken);
            const refreshToken = this.resolveToken(googleAccount.refreshToken);

            const auth = this.googleProvider.getClient({
                access_token: accessToken ?? undefined,
                refresh_token: refreshToken ?? undefined,
                expiry_date: googleAccount.expiresAt?.getTime()
            });

            const data = await this.googleProvider.listEvents(auth, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
            const items = data.items || [];
            
            for (const event of items) {
                await this.processEventInternal(userId, event);
            }

            return { count: items.length };
        } catch (error: unknown) {
            logger.error({ msg: 'Historical Google Sync Failed', userId, error: (error as Error).message });
            return { count: 0 };
        }
    }

    private resolveToken(token: string | null): string | null {
        if (!token) return null;
        return isEncrypted(token) ? decrypt(token, env.ENCRYPTION_SECRET) : token;
    }

    private async handleMissingTokens(userId: string, phoneNumber: string | null): Promise<Result<void>> {
        logger.warn({ msg: 'Sync Aborted: Missing Google tokens', userId });
        
        if (phoneNumber) {
            const alertKey = `sync_alert_sent:${userId}`;
            const alreadyAlerted = await this.redisService.getCache(alertKey);
            if (!alreadyAlerted) {
                await this.whatsappService.sendSyncFailureAlert(userId, phoneNumber);
                await this.redisService.setCache(alertKey, 'true', 24 * 60 * 60);
            }
        }
        
        return Failure('Google authentication missing', ErrorCode.GOOGLE_AUTH_EXPIRED);
    }

    private async processEventInternal(userId: string, event: calendar_v3.Schema$Event) {
        const startStr = event.start?.dateTime || event.start?.date;
        if (!startStr) return;

        let schedule = new Date(startStr);
        const now = new Date();
        const externalId = `google_${event.id}`;
        
        const repeat = this.mapGoogleRecurrence(event.recurrence);
        let status: ReminderStatus = ReminderStatus.PENDING;
        
        const isCancelled = event.status === 'cancelled';
        const isPast = schedule < now;

        if (isCancelled) {
            status = ReminderStatus.CANCELLED;
        } else if (isPast) {
            if (repeat !== RepeatInterval.NONE) {
                const futureSchedule = DateUtils.jumpToFuture(schedule, repeat, [], now);
                if (futureSchedule > now) {
                    schedule = futureSchedule;
                    status = ReminderStatus.PENDING;
                } else {
                    status = ReminderStatus.PAST;
                }
            } else {
                status = ReminderStatus.PAST;
            }
        }

        if (repeat !== RepeatInterval.NONE) {
            await this.repository.pruneRecurringBloat(userId, externalId, event.summary || '');
        }

        const reminder = await this.repository.cleanAndRouteEvent(userId, externalId, {
            title: event.summary || 'Google Calendar Event',
            message: event.description || 'Google Calendar Event Sync',
            schedule: schedule,
            repeat: repeat
        }, status, now);
        
        if (status === ReminderStatus.PENDING) {
            eventBus.emitDomainEvent(DomainEvent.REMINDER_CREATED, { reminderId: reminder.id, userId });
        }
    }

    private mapGoogleRecurrence(recurrence?: string[] | null): RepeatInterval {
        if (!recurrence || recurrence.length === 0) return RepeatInterval.NONE;
        const rrule = recurrence[0];
        if (rrule.includes('FREQ=DAILY')) return RepeatInterval.DAILY;
        if (rrule.includes('FREQ=WEEKLY')) return RepeatInterval.WEEKLY;
        if (rrule.includes('FREQ=MONTHLY')) return RepeatInterval.MONTHLY;
        if (rrule.includes('FREQ=YEARLY')) return RepeatInterval.YEARLY;
        return RepeatInterval.NONE;
    }
}
