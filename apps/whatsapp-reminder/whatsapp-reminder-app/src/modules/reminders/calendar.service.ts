import { google, calendar_v3 } from 'googleapis';
import crypto from 'crypto';
import { logger } from '@ingetin/logger';
import { DateUtils } from '../../utils/dateUtils';
import { env } from '../../core/config';
import { CalendarRepository } from './calendar.repository';
import { RedisService } from '../infra/redis.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { CalendarSyncFailedError, GoogleAuthExpiredError } from '../../core/errors/DomainErrors';
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

    getAuthUrl(userId: string) {
        const client = this.googleProvider.getClient();
        
        // Generate a random state for CSRF protection
        const state = crypto.randomUUID();
        
        // Store state in Redis with a 10-minute expiry
        this.redisService.setOTP(`oauth_state:${state}`, userId, 600);

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

    async handleCallback(code: string, userId: string) {
        const client = this.googleProvider.getClient();
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const userInfo = await oauth2.userinfo.get();
        const googleEmail = userInfo.data.email;

        const user = await this.repository.findUserById(userId);
        if (!user) throw new Error('User not found');

        if (!googleEmail || googleEmail.toLowerCase() !== user.email?.toLowerCase()) {
            logger.warn({ msg: 'Google Link Rejected: Email mismatch', userId, expected: user.email, received: googleEmail });
            throw new Error(`Email mismatch. Please connect using ${user.email}`);
        }

        await this.repository.updateUserTokens(userId, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
            scope: tokens.scope,
            token_type: tokens.token_type
        });
        
        // Invalidate setup cache (Google linked)
        await this.redisService.deleteCache(`setup:${userId}`);
        
        logger.info({ msg: 'Google account linked and user activated via Gmail verification', userId, email: googleEmail });
    }

    async syncAllUserEvents() {
        const users = await this.repository.findActiveUsersWithGoogle();
        logger.info({ msg: 'Queueing background Calendar sync', count: users.length });

        for (const user of users) {
            try {
                // Dispatch job to BullMQ
                await calendarQueue.add('sync-user-calendar', { 
                    userId: user.id 
                }, {
                    jobId: `sync:${user.id}:${new Date().toISOString().split('T')[0]}`, // Once per day unique ID
                    removeOnComplete: true
                });
            } catch (error: any) {
                logger.error({ msg: 'Failed to queue user calendar sync', userId: user.id, error: error.message });
            }
        }
    }

    async syncUserEvents(userId: string) {
        const lockKey = `sync:lock:${userId}`;
        const isLocked = await this.redisService.acquireLock(lockKey, 300); // 5 minutes lock
        if (!isLocked) {
            logger.warn({ msg: 'Sync Aborted: Process already running for user', userId });
            return;
        }

        try {
            logger.info({ msg: 'Manual Sync: Initializing for user', userId });
            const user = await this.repository.findUserById(userId);
            if (!user) throw new Error('User not found');
            
            // Find Google Social Account
            const googleAccount = user.socialAccounts?.find((a) => a.provider === 'GOOGLE');

            if (!googleAccount?.refreshToken) {
                logger.warn({ msg: 'Sync Aborted: Missing Google tokens', userId });
                
                // Notify user about disconnection (Once every 24h)
                if (user.phoneNumber) {
                    const alertKey = `sync_alert_sent:${userId}`;
                    const alreadyAlerted = await this.redisService.getCache(alertKey);
                    if (!alreadyAlerted) {
                        await this.whatsappService.sendSyncFailureAlert(userId, user.phoneNumber);
                        await this.redisService.setCache(alertKey, 'true', 24 * 60 * 60);
                    }
                }
                
                throw new GoogleAuthExpiredError();
            }

            const accessToken = googleAccount.accessToken && isEncrypted(googleAccount.accessToken) 
                ? decrypt(googleAccount.accessToken, env.ENCRYPTION_SECRET) 
                : googleAccount.accessToken;
                
            const refreshToken = googleAccount.refreshToken && isEncrypted(googleAccount.refreshToken) 
                ? decrypt(googleAccount.refreshToken, env.ENCRYPTION_SECRET) 
                : googleAccount.refreshToken;

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
                    logger.error({ msg: 'Google Token Expired (invalid_grant)', userId });
                    throw new GoogleAuthExpiredError();
                }
                throw err;
            });

            const items = data.items || [];
            logger.info({ msg: 'Unique Google Items Found', count: items.length, userId });
            
            for (const event of items) {
                try {
                    // Optimization: Skip processing if event hasn't changed (ETag check)
                    const cacheKey = `cal_etag:${userId}:${event.id}`;
                    const lastEtag = await this.redisService.getCache(cacheKey);
                    
                    if (lastEtag === event.etag) {
                        continue; // No changes since last sync
                    }

                    await this.processEventInternal(userId, event);
                    
                    // Cache the new ETag for 24 hours
                    if (event.etag) {
                        await this.redisService.setCache(cacheKey, event.etag, 24 * 60 * 60);
                    }
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : String(err);
                    logger.error({ msg: 'Failed to process calendar event', eventId: event.id, error: message });
                }
            }
            logger.info({ msg: 'Sync Complete', userId });
        } finally {
            await this.redisService.releaseLock(lockKey);
        }
    }

    async syncUserEventsHistorical(userId: string) {
        try {
            const user = await this.repository.findUserById(userId);
            if (!user) throw new Error('User not found');
            
            // Find Google Social Account
            const googleAccount = user.socialAccounts?.find((a) => a.provider === 'GOOGLE');

            if (!googleAccount?.refreshToken) {
                logger.warn({ msg: 'Historical Sync Aborted: Missing Google tokens', userId });
                return { count: 0 };
            }

            const accessToken = googleAccount.accessToken && isEncrypted(googleAccount.accessToken) 
                ? decrypt(googleAccount.accessToken, env.ENCRYPTION_SECRET) 
                : googleAccount.accessToken;
                
            const refreshToken = googleAccount.refreshToken && isEncrypted(googleAccount.refreshToken) 
                ? decrypt(googleAccount.refreshToken, env.ENCRYPTION_SECRET) 
                : googleAccount.refreshToken;

            const auth = this.googleProvider.getClient({
                access_token: accessToken ?? undefined,
                refresh_token: refreshToken ?? undefined,
                expiry_date: googleAccount.expiresAt?.getTime()
            });

            const calendar = google.calendar({ version: 'v3', auth });
            let pageToken: string | undefined;
            let pages = 0;
            let totalProcessed = 0;

            do {
                const response = await calendar.events.list({
                    calendarId: 'primary',
                    maxResults: 50,
                    singleEvents: false,
                    showDeleted: true,
                    pageToken: pageToken
                }, { timeout: 60000 }) as { data: calendar_v3.Schema$Events };

                const items = response.data.items || [];
                pageToken = response.data.nextPageToken || undefined;
                pages++;
                
                logger.info({ msg: 'Fetching Google batch', count: items.length, userId, next: !!pageToken });

                // Process this batch immediately instead of accumulating
                for (const event of items) {
                    try {
                        await this.processEventInternal(user.id, event);
                        totalProcessed++;
                    } catch (err: any) {
                        logger.error({ msg: 'Failed to process historical item', userId, eventId: event.id, error: err.message });
                    }
                }

                if (pages >= 20 || totalProcessed >= 1000) {
                    logger.warn({ msg: 'Historical sync limit reached', userId, pages, itemsCount: totalProcessed });
                    break;
                }
            } while (pageToken);

            return { count: totalProcessed };
        } catch (error: any) {
            logger.error({ msg: 'Historical Google Sync Failed', userId, error: error.message });
            throw new CalendarSyncFailedError(error.message);
        }
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
            const count = await this.repository.pruneRecurringBloat(userId, externalId, event.summary || '');
            if (count > 0) logger.info({ msg: 'Self-healed history bloat (Schedule)', externalId, count });
        }

        const data: Prisma.ReminderCreateInput = {
            user: { connect: { id: userId } },
            externalId,
            title: event.summary || 'Google Calendar Event',
            message: event.description || 'Google Calendar Event Sync',
            schedule: schedule,
            repeat: repeat,
            status: status
        };

        const reminder = await this.repository.cleanAndRouteEvent(userId, externalId, data, status, now);
        
        if (status === ReminderStatus.PENDING) {
            eventBus.emitDomainEvent(DomainEvent.REMINDER_CREATED, { 
                reminderId: reminder.id, 
                userId 
            });
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
