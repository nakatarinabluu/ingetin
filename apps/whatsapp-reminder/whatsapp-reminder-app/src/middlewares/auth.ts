import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import prisma from '../modules/infra/prisma.service';
import { logger } from '@ingetin/logger';
import { Role } from '@prisma/client';
import { env } from '../core/config';
import { container } from '../core/container';

export interface JWTPayload {
    id: string;
    username?: string;
    phone?: string;
    role: Role;
    isActivated?: boolean;
    licenseStatus?: string;
    jti?: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends FastifyRequest {
    user?: JWTPayload;
}

export const authMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    // 1. Get raw cookie
    const rawCookie = req.cookies?.wa_token;
    let token: string | null = null;

    if (rawCookie) {
        // Fastify-cookie automatically prefixes signed cookies with 's:'
        // But req.cookies might already contain the unsigned value depending on setup.
        // To be safe, we explicitly unsign the wa_token.
        const result = req.unsignCookie(rawCookie);
        if (result.valid && result.value) {
            token = result.value;
        } else {
            // If unsign fails, it might be an unsigned dev cookie or a malformed one
            token = rawCookie; 
        }
    }

    // 2. Fallback to Header
    if (!token || token.startsWith('s:')) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    // 3. Clean token check (JWT must have 2 dots)
    if (!token || (token.includes('.') && token.split('.').length !== 3)) {
        // Not a valid JWT, likely a failed signature or old cookie
        token = null;
    }

    if (!token) {
        logger.debug({ msg: 'Auth: No token found in request', path: req.url });
        return reply.status(401).send({
            success: false,
            error: 'Access denied. No valid token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
        
        // --- JWT REVOCATION CHECK (BLOCKLIST) ---
        if (decoded.jti) {
            const isRevoked = await container.redisService.getOTP(`blocklist:${decoded.jti}`);
            if (isRevoked) {
                logger.warn({ msg: 'Token Revoked: Access denied', jti: decoded.jti, userId: decoded.id });
                return reply.status(401).send({
                    success: false,
                    error: 'This session has been revoked. Please log in again.'
                });
            }
        }

        req.user = decoded;
    } catch (error: unknown) {
        const err = error as Error;
        logger.error({ msg: 'Token Verification Failed', error: err.message, token: token.substring(0, 10) + '...' });
        return reply.status(401).send({
            success: false,
            error: 'Invalid or expired token.'
        });
    }
};

/**
 * Ensures the user has a linked phone number (WhatsApp) 
 */
export const linkedMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    if (!req.user) return reply.status(401).send({ success: false, error: 'Unauthorized' });
    
    const cacheKey = `linked:${req.user.id}`;
    const isLinked = await container.redisService.getCache(cacheKey);
    if (isLinked === 'true') return;

    const user = await container.userRepository.findById(req.user.id);
    if (!user || !user.phoneNumber) {
        return reply.status(403).send({ success: false, error: 'WhatsApp phone number not linked.' });
    }

    await container.redisService.setCache(cacheKey, 'true', 3600);
};

/**
 * Ensures the user has BOTH a linked phone (WhatsApp) AND 
 * a linked Google Calendar
 */
export const setupMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    if (!req.user) return reply.status(401).send({ success: false, error: 'Unauthorized' });
    
    const cacheKey = `setup:${req.user.id}`;
    const isSetup = await container.redisService.getCache(cacheKey);
    if (isSetup === 'true') return;

    const user = await container.userRepository.findById(req.user.id);
    const googleAccount = await container.userRepository.findSocialAccount(req.user.id, 'GOOGLE');
    
    if (!user || !user.phoneNumber || !googleAccount?.refreshToken) {
        return reply.status(403).send({ success: false, error: 'Account setup incomplete. Please link WhatsApp and Google Calendar.' });
    }

    await container.redisService.setCache(cacheKey, 'true', 3600);
};

export const adminMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    if (req.user && req.user.role === 'ADMIN') {
        return;
    }
    
    return reply.status(403).send({
        success: false,
        error: 'Access denied. Admins only.'
    });
};

export const licenseMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    if (!req.user) return reply.status(401).send({ success: false, error: 'Unauthorized' });

    if (req.user.role === 'ADMIN') return; // Admins bypass license check

    // Check JWT payload first
    if (req.user.isActivated && req.user.licenseStatus === 'USED') {
        return;
    }

    // Fallback to DB
    const user = await container.userRepository.findWithLicenseById(req.user.id);
    if (!user?.isActivated || user.license?.status !== 'USED') {
        return reply.status(403).send({ success: false, error: 'Active license required.' });
    }
};
