import { PrismaClient, Prisma, User, License } from '@prisma/client';
import { RedisService } from '../infra/redis.service';
import { EncryptionService } from '../infra/encryption.service';

export class UserRepository {
    constructor(
        public readonly prismaDb: PrismaClient,
        private readonly redisService: RedisService,
        private readonly encryptionService: EncryptionService
    ) {}

    async findById(id: string): Promise<User | null> {
        return await this.prismaDb.user.findUnique({ where: { id } });
    }

    async findAll(params?: { 
        skip?: number; 
        take?: number; 
        where?: Prisma.UserWhereInput; 
        orderBy?: Prisma.UserOrderByWithRelationInput;
        include?: Prisma.UserInclude;
    }): Promise<User[]> {
        return await this.prismaDb.user.findMany(params as Prisma.UserFindManyArgs);
    }

    async count(where?: Prisma.UserWhereInput): Promise<number> {
        return await this.prismaDb.user.count({ where });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return await this.prismaDb.user.create({ data });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return await this.prismaDb.user.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<User> {
        return await this.prismaDb.user.delete({
            where: { id }
        });
    }

    async findProfile(id: string) {
        const cacheKey = `user:profile:${id}`;
        if (this.redisService) {
            const cached = await this.redisService.getCache(cacheKey);
            if (cached) return JSON.parse(cached);
        }

        const profile = await this.prismaDb.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phoneNumber: true,
                isActivated: true,
                createdAt: true,
                lastLogin: true,
                license: true,
                socialAccounts: true
            }
        });

        if (!profile) return null;

        // Decrypt PII before returning
        const decrypted = this.encryptionService.decryptObject(profile, ['email', 'phoneNumber']);

        if (this.redisService && decrypted) {
            await this.redisService.setCache(cacheKey, JSON.stringify(decrypted), 300);
        }
        return decrypted;
    }


    async findFullDetails(identifier: string) {
        // Try direct ID first, then search via Blind Index
        let user = await this.prismaDb.user.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { username: identifier }
                ]
            },
            include: { license: true }
        });

        if (!user) {
            const hash = this.encryptionService.generateBlindIndex(identifier);
            user = await this.prismaDb.user.findFirst({
                where: {
                    OR: [
                        { emailHash: hash || undefined },
                        { phoneHash: hash || undefined }
                    ]
                },
                include: { license: true }
            });
        }

        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']);
    }

    async findByEmail(email: string): Promise<User | null> {
        const hash = this.encryptionService.generateBlindIndex(email);
        const user = await this.prismaDb.user.findUnique({
            where: { emailHash: hash || undefined }
        });
        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']) as User | null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await this.prismaDb.user.findFirst({
            where: { username: { equals: username.toLowerCase(), mode: 'insensitive' } }
        });
        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']) as User | null;
    }

    async findWithLicense(identifier: string) {
        const hash = this.encryptionService.generateBlindIndex(identifier);
        const user = await this.prismaDb.user.findFirst({
            where: {
                OR: [
                    { username: { equals: identifier.toLowerCase(), mode: 'insensitive' } },
                    { emailHash: hash || undefined }
                ]
            },
            include: {
                license: true
            }
        });
        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']);
    }

    async findWithLicenseById(id: string) {
        const user = await this.prismaDb.user.findUnique({
            where: { id },
            include: {
                license: true
            }
        });
        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']);
    }

    async findByRefreshToken(refreshToken: string) {
        const user = await this.prismaDb.user.findUnique({
            where: { refreshToken },
            include: {
                license: true
            }
        });
        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']);
    }

    async findManyWithFilter(where: Prisma.UserWhereInput, skip: number, take: number) {
        const users = await this.prismaDb.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                phoneNumber: true,
                isActivated: true,
                createdAt: true,
                lastLogin: true,
                license: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        });

        return users.map((u) => this.encryptionService.decryptObject(u, ['email', 'phoneNumber']));
    }

    async findSocialAccount(userId: string, provider: 'GOOGLE' | 'WHATSAPP' | 'DISCORD') {
        const account = await this.prismaDb.socialAccount.findUnique({
            where: {
                userId_provider: { userId, provider }
            }
        });
        return this.encryptionService.decryptObject(account, ['accessToken', 'refreshToken']);
    }

    async upsertSocialAccount(userId: string, provider: 'GOOGLE' | 'WHATSAPP' | 'DISCORD', data: Prisma.SocialAccountUncheckedCreateInput) {
        const encrypted = this.encryptionService.encryptObject(data, ['accessToken', 'refreshToken']);
        
        return await this.prismaDb.socialAccount.upsert({
            where: {
                userId_provider: { userId, provider }
            },
            create: {
                userId,
                provider,
                accessToken: encrypted?.accessToken ?? '',
                refreshToken: encrypted?.refreshToken,
                expiresAt: encrypted?.expiresAt
            },
            update: {
                accessToken: encrypted?.accessToken ?? '',
                refreshToken: encrypted?.refreshToken,
                expiresAt: encrypted?.expiresAt
            }
        });
    }

    async findActiveUsersWithSocial(provider: 'GOOGLE' | 'WHATSAPP' | 'DISCORD') {
        return this.prismaDb.user.findMany({
            where: {
                socialAccounts: {
                    some: { provider, refreshToken: { not: null } }
                },
                isActivated: true
            },
            include: {
                socialAccounts: {
                    where: { provider }
                }
            }
        });
    }

    async findLicenseById(id: string) {
        return await this.prismaDb.license.findUnique({ where: { id } });
    }

    async findLicenseByKey(key: string): Promise<License | null> {
        return await this.prismaDb.license.findUnique({
            where: { key: key.toUpperCase() }
        });
    }

    async findAllLicenses(where: Prisma.LicenseWhereInput, skip: number, take: number) {
        return await this.prismaDb.license.findMany({
            where,
            include: { user: { select: { id: true, username: true, firstName: true, lastName: true, createdAt: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        });
    }

    async countLicenses(where?: Prisma.LicenseWhereInput) {
        return await this.prismaDb.license.count({ where });
    }

    async createLicense(data: Prisma.LicenseCreateInput) {
        return await this.prismaDb.license.create({ data });
    }

    async updateLicense(id: string, data: Prisma.LicenseUpdateInput) {
        return await this.prismaDb.license.update({ where: { id }, data });
    }

    async revokeLicense(id: string): Promise<void> {
        await this.prismaDb.$transaction([
            this.prismaDb.license.update({
                where: { id },
                data: { status: 'REVOKED', userId: null }
            }),
            this.prismaDb.user.updateMany({
                where: { licenseId: id },
                data: { isActivated: false, licenseId: null }
            })
        ]);
    }

    async activateLicense(userId: string, licenseId: string): Promise<void> {
        await this.prismaDb.$transaction([
            this.prismaDb.license.update({
                where: { id: licenseId },
                data: { status: 'USED', userId: userId, activatedAt: new Date() }
            }),
            this.prismaDb.user.update({
                where: { id: userId },
                data: { isActivated: true, licenseId: licenseId }
            })
        ]);
    }

    async clearAllReminders(userId: string): Promise<void> {
        await this.prismaDb.reminder.deleteMany({ where: { userId } });
    }

    async getUserStats(userId: string) {
        const [scheduledCount, sentCount, deletedCount, messagesCount] = await Promise.all([
            this.prismaDb.reminder.count({ where: { userId, status: 'PENDING' } }),
            this.prismaDb.reminder.count({ where: { userId, status: 'SENT' } }),
            this.prismaDb.reminder.count({ where: { userId, status: 'CANCELLED' } }),
            this.prismaDb.message.count({ where: { userId } })
        ]);
        return { scheduledCount, sentCount, deletedCount, messagesCount };
    }

    async findByPhone(phone: string): Promise<User | null> {
        const hash = this.encryptionService.generateBlindIndex(phone);
        const user = await this.prismaDb.user.findUnique({
            where: { phoneHash: hash || undefined }
        });
        return this.encryptionService.decryptObject(user, ['email', 'phoneNumber']) as User | null;
    }
}
