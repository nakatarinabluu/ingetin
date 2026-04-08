import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { RedisService } from '../infra/redis.service';
import { UnauthorizedError, ConflictError } from '../../core/errors/AppError';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

vi.mock('argon2');
vi.mock('jsonwebtoken');
vi.mock('../../core/config', () => ({
    env: {
        JWT_SECRET: 'test_secret_key_long_enough',
        REDIS_URL: 'redis://localhost:6379',
        FRONTEND_URL: 'http://localhost:3000'
    }
}));
vi.mock('@ingetin/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

describe('AuthService', () => {
    let service: AuthService;
    let mockRepo: any;
    let mockRedis: any;
    let mockEncryption: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRepo = {
            findWithLicense: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
            findByRefreshToken: vi.fn(),
            findLicenseByKey: vi.fn(),
            activateLicense: vi.fn(),
            findWithLicenseById: vi.fn(),
            findById: vi.fn(),
            deleteCache: vi.fn()
        };

        mockRedis = {
            getOTP: vi.fn(),
            setOTP: vi.fn(),
            deleteOTP: vi.fn(),
            setCache: vi.fn(),
            getCache: vi.fn(),
            deleteCache: vi.fn()
        };

        mockEncryption = {
            encryptField: vi.fn((v) => v),
            decryptField: vi.fn((v) => v),
            generateBlindIndex: vi.fn((v) => v),
            decryptObject: vi.fn((v) => v)
        };

        service = new AuthService(mockRepo as any, mockRedis as any, mockEncryption as any);
        
        // Default JWT mock
        (jwt.sign as any).mockReturnValue('mocked_token');
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                id: 'user_1',
                username: 'testuser',
                password: 'hashed_password',
                role: 'USER',
                isActivated: true
            };

            mockRedis.getOTP.mockResolvedValue(null); // No lockout
            mockRepo.findWithLicense.mockResolvedValue(mockUser);
            (argon2.verify as any).mockResolvedValue(true);

            const result = await service.login({ username: 'testuser', password: 'password123' });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.token).toBe('mocked_token');
            }
            expect(mockRedis.deleteOTP).toHaveBeenCalled();
            expect(mockRepo.update).toHaveBeenCalledWith('user_1', expect.objectContaining({ lastLogin: expect.any(Date) }));
        });

        it('should throw UnauthorizedError on invalid password', async () => {
            const mockUser = {
                id: 'user_1',
                username: 'testuser',
                password: 'hashed_password'
            };

            mockRedis.getOTP.mockResolvedValue(null);
            mockRepo.findWithLicense.mockResolvedValue(mockUser);
            (argon2.verify as any).mockResolvedValue(false);

            await expect(service.login({ username: 'testuser', password: 'wrong_password' }))
                .rejects.toThrow(UnauthorizedError);
            
            expect(mockRedis.setOTP).toHaveBeenCalled(); // Increment failure count
        });

        it('should throw UnauthorizedError if account is locked', async () => {
            mockRedis.getOTP.mockResolvedValue('5'); // 5 failures

            await expect(service.login({ username: 'testuser', password: 'password123' }))
                .rejects.toThrow('Account temporarily locked');
        });
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerData = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User'
            };

            (argon2.hash as any).mockResolvedValue('hashed_password');
            mockRepo.create.mockResolvedValue({
                id: 'user_new',
                username: 'newuser',
                email: 'new@example.com',
                role: 'USER'
            });

            const result = await service.register(registerData);

            expect(result.success).toBe(true);
            expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                username: 'newuser',
                password: 'hashed_password'
            }));
        });

        it('should throw ConflictError if username or email is taken', async () => {
            mockRepo.create.mockRejectedValue({ code: 'P2002', meta: { target: ['username'] } });

            await expect(service.register({
                username: 'existing',
                email: 'existing@example.com',
                password: 'password',
                firstName: 'A',
                lastName: 'B'
            })).rejects.toThrow(ConflictError);
        });
    });

    describe('logout', () => {
        it('should clear refresh token and block access token', async () => {
            await service.logout('user_1', 'jti_123');

            expect(mockRepo.update).toHaveBeenCalledWith('user_1', {
                refreshToken: null,
                refreshTokenExpiresAt: null
            });
            expect(mockRedis.setOTP).toHaveBeenCalledWith('blocklist:jti_123', 'revoked', expect.any(Number));
        });
    });

    describe('refresh', () => {
        it('should return new tokens for a valid refresh token', async () => {
            const mockUser = { id: 'user_1', username: 'testuser', refreshTokenExpiresAt: new Date(Date.now() + 100000) };
            mockRepo.findByRefreshToken.mockResolvedValue(mockUser);

            const result = await service.refresh('valid_refresh_token');

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.token).toBe('mocked_token');
            }
        });

        it('should throw UnauthorizedError for expired refresh token', async () => {
            const mockUser = { id: 'user_1', refreshTokenExpiresAt: new Date(Date.now() - 100000) };
            mockRepo.findByRefreshToken.mockResolvedValue(mockUser);

            await expect(service.refresh('expired_token')).rejects.toThrow(UnauthorizedError);
        });
    });
});
