import { PrismaClient, ReminderStatus, Prisma } from '@prisma/client';
import { logger } from '@ingetin/logger';
import { encrypt } from '../../utils/crypto';
import { env } from '../../core/config';

export class CalendarRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findActiveUsersWithGoogle() {
        return this.prisma.user.findMany({
            where: {
                socialAccounts: {
                    some: { provider: 'GOOGLE', refreshToken: { not: null } }
                },
                isActivated: true
            },
            include: {
                socialAccounts: {
                    where: { provider: 'GOOGLE' }
                }
            }
        });
    }

    async findUserById(userId: string) {
        return this.prisma.user.findUnique({ 
            where: { id: userId },
            include: { socialAccounts: true }
        });
    }

    async updateUserTokens(userId: string, tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null; scope?: string | null; token_type?: string | null }) {
        const encryptedAccessToken = tokens.access_token ? encrypt(tokens.access_token, env.ENCRYPTION_SECRET) : null;
        const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token, env.ENCRYPTION_SECRET) : null;

        return this.prisma.socialAccount.upsert({
            where: {
                userId_provider: { userId, provider: 'GOOGLE' }
            },
            create: {
                userId,
                provider: 'GOOGLE',
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                scope: tokens.scope,
                tokenType: tokens.token_type
            },
            update: {
                accessToken: encryptedAccessToken,
                ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                scope: tokens.scope,
                tokenType: tokens.token_type
            }
        });
    }

    async cleanAndRouteEvent(userId: string, externalId: string, data: Prisma.ReminderCreateInput, status: ReminderStatus, now: Date) {
        const reminderData = {
            title: data.title,
            message: data.message,
            status: status as ReminderStatus,
            repeat: data.repeat,
            sentAt: (status === 'SENT' || status === 'FAILED' || status === 'PAST') ? now : null,
            deletedAt: (status === 'CANCELLED') ? now : null
        };

        return this.prisma.reminder.upsert({
            where: {
                userId_externalId_schedule: {
                    userId,
                    externalId,
                    schedule: data.schedule as Date
                }
            },
            create: {
                ...reminderData,
                schedule: data.schedule as Date,
                externalId,
                user: { connect: { id: userId } }
            },
            update: reminderData
        });
    }

    async pruneRecurringBloat(userId: string, externalId: string, title: string) {
        const masterPrefix = `${externalId}_`;
        try {
            const pruned = await this.prisma.reminder.deleteMany({
                where: {
                    userId,
                    OR: [
                        { externalId: { startsWith: masterPrefix } },
                        { 
                            title: title, 
                            repeat: 'NONE',
                            status: 'PENDING',
                            externalId: { startsWith: 'google_' } 
                        }
                    ]
                }
            });
            return pruned.count;
        } catch (pruneErr) {
            logger.warn({ msg: 'Pruning cycle partial failure', externalId });
            return 0;
        }
    }
}

