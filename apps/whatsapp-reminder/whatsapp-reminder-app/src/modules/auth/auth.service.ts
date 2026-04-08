import { PrismaClient, Prisma, User, Role as PrismaRole } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '@ingetin/logger';
import { UserRepository } from './user.repository';
import { Success, Failure, Result } from '../../core/result';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { RedisService } from '../infra/redis.service';
import { UnauthorizedError, ConflictError, AppError, BadRequestError } from '../../core/errors/AppError';
import { InvalidLicenseKeyError } from '../../core/errors/DomainErrors';
import { LoginInput, RegisterInput, UserDTO, Role as SharedRole } from '@ingetin/types';
import { env } from '../../core/config';
import { EncryptionService } from '../infra/encryption.service';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface LoginResult {
    token: string;
    refreshToken: string;
    user: UserDTO & { 
        phoneNumber: string | null;
        isActivated: boolean;
        licenseStatus: string;
    };
}

export interface RefreshResult {
    token: string;
    refreshToken: string;
}

export interface RegisterResult {
    token: string;
    refreshToken: string;
    user: UserDTO & {
        isActivated: boolean;
        licenseStatus: string;
    };
}

export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly encryptionService: EncryptionService
    ) {}

    /**
     * Generate Access and Refresh Tokens
     */
    private async generateTokens(user: Pick<User, 'id' | 'username' | 'role' | 'isActivated'> & { license?: { status: string } | null }): Promise<AuthTokens> {
        const isAdmin = user.role === PrismaRole.ADMIN;
        const effectiveActivation = isAdmin ? true : user.isActivated;
        const licenseStatus = isAdmin ? 'USED' : (user.license?.status || 'NONE');
        const jti = crypto.randomUUID();

        const accessToken = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role, 
                isActivated: effectiveActivation,
                licenseStatus,
                jti
            },
            env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.userRepository.update(user.id, {
            refreshToken: hashedRefreshToken,
            refreshTokenExpiresAt: expiresAt
        });

        return { accessToken, refreshToken, expiresAt };
    }

    /**
     * Handle user login
     */
    async login(data: LoginInput): Promise<Result<LoginResult>> {
        const usernameOrEmail = data.username;
        const password = data.password;
        const lockoutKey = `lockout:${usernameOrEmail.toLowerCase()}`;
        
        try {
            const failures = await this.redisService.getOTP(lockoutKey);
            if (failures && parseInt(failures) >= 5) {
                throw new UnauthorizedError('Account temporarily locked. Please try again in 15 minutes.');
            }

            const user = await this.userRepository.findWithLicense(usernameOrEmail);
            if (!user || !user.password) {
                throw new UnauthorizedError('Invalid credentials');
            }

            const isMatch = await argon2.verify(user.password, password);
            if (!isMatch) {
                const newFailures = (failures ? parseInt(failures) : 0) + 1;
                await this.redisService.setOTP(lockoutKey, newFailures.toString(), 900);
                throw new UnauthorizedError('Invalid credentials');
            }

            await this.redisService.deleteOTP(lockoutKey);
            if (!user.username) throw new BadRequestError('Incomplete user profile');
            const tokens = await this.generateTokens(user);

            return Success({
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role as SharedRole,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    isActivated: user.role === PrismaRole.ADMIN ? true : user.isActivated,
                    licenseStatus: user.role === PrismaRole.ADMIN ? 'USED' : (user.license?.status || 'NONE'),
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            const err = error as Error;
            if (err.name === 'UnauthorizedError') throw error;
            logger.error({ msg: 'AuthService Login Error', error: err.message });
            return Failure('Internal server error during login');
        }
    }

    async refresh(refreshToken: string): Promise<Result<RefreshResult>> {
        try {
            const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
            const user = await this.userRepository.findByRefreshToken(hashedRefreshToken);
            
            if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
                return Failure('Invalid or expired refresh token');
            }

            const tokens = await this.generateTokens(user);

            return Success({
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        } catch (error) {
            const err = error as Error;
            logger.error({ msg: 'AuthService Refresh Error', error: err.message });
            return Failure('Refresh failed');
        }
    }

    async logout(userId: string, jti?: string): Promise<Result<{ message: string }>> {
        await this.userRepository.update(userId, {
            refreshToken: null,
            refreshTokenExpiresAt: null
        });

        if (jti) {
            await this.redisService.setOTP(`blocklist:${jti}`, 'revoked', 7 * 24 * 60 * 60);
        }

        return Success({ message: 'Logged out successfully' });
    }

    async register(data: RegisterInput): Promise<Result<RegisterResult>> {
        try {
            const hashedPassword = await argon2.hash(data.password);
            const email = data.email.toLowerCase();
            const encryptedEmail = this.encryptionService.encryptField(email);
            const emailHash = this.encryptionService.generateBlindIndex(email);
            
            const user = await this.userRepository.create({
                username: data.username.toLowerCase(),
                email: encryptedEmail!,
                emailHash: emailHash!,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: PrismaRole.USER,
                isActivated: false
            });

            eventBus.emitDomainEvent(DomainEvent.USER_REGISTERED, { 
                userId: user.id, 
                username: user.username!, 
                email: email // Original email for event notifications
            });

            const tokens = await this.generateTokens(user);

            return Success({
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName || null,
                    lastName: user.lastName || null,
                    email: user.email || null,
                    role: SharedRole.USER,
                    phoneNumber: null,
                    isActivated: false,
                    licenseStatus: 'NONE',
                    createdAt: user.createdAt
                }
            });
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = (error.meta?.target as string[]) || [];
                if (target.includes('username')) throw new ConflictError('Username already taken');
                if (target.includes('emailHash')) throw new ConflictError('Email already taken');
                throw new ConflictError('Duplicate value');
            }
            if (error instanceof AppError) throw error;
            const err = error as Error;
            logger.error({ msg: 'AuthService Register Error', error: err.message });
            throw err;
        }
    }

    async activateLicense(userId: string, code: string): Promise<Result<RefreshResult>> {
        try {
            const license = await this.userRepository.findLicenseByKey(code);
            if (!license || license.status !== 'AVAILABLE') {
                throw new InvalidLicenseKeyError();
            }

            await this.userRepository.activateLicense(userId, license.id);
            eventBus.emitDomainEvent(DomainEvent.USER_ACTIVATED, { userId, licenseId: license.id });

            const user = await this.userRepository.findWithLicenseById(userId);
            if (!user) throw new BadRequestError('User not found after activation');
            const tokens = await this.generateTokens(user);

            return Success({ 
                token: tokens.accessToken, 
                refreshToken: tokens.refreshToken
            });
        } catch (error) {
            const err = error as Error;
            if (err instanceof AppError) throw err;
            throw new BadRequestError('Activation failed');
        }
    }
}
