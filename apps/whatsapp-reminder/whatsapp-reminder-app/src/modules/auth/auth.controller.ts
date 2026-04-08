import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@ingetin/logger';
import { UserRepository } from './user.repository';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { formatPhone } from '../../utils/phoneFormatter';
import { 
    LoginInput, 
    RegisterInput, 
    UpdateProfileInput, 
    ActivateLicenseInput 
} from '@ingetin/types';
import { BadRequestError } from '../../core/errors/AppError';
import { AuthRequest } from '../../middlewares/auth';

export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Check if a username is available for registration
     */
    checkUsername = async (req: FastifyRequest, reply: FastifyReply) => {
        const query = req.query as { username?: string };
        const username = query.username;
        
        if (!username) {
            throw new BadRequestError('Username is required');
        }
        
        const user = await this.userRepository.findByUsername(username);
        const isAvailable = !user;

        return reply.send({ 
            success: true,
            data: { 
                available: isAvailable,
                message: isAvailable ? 'Username available' : 'Username already taken'
            }
        });
    };

    /**
     * Standard Login Flow
     */
    login = async (req: FastifyRequest, reply: FastifyReply) => {
        const validatedData = req.body as LoginInput;
        const result = await this.authService.login(validatedData);

        if (!result.success) {
            if (result.code === 'LOCKED') reply.status(429);
            else if (result.code === 'UNAUTHORIZED') reply.status(401);
            return result;
        }

        const isProd = process.env.NODE_ENV === 'production';
        
        reply.setCookie('wa_token', result.data.token, {
            httpOnly: true,
            secure: isProd,
            signed: true, // EXPLICITLY SIGN
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        const { token, ...rest } = result.data;
        return { success: true, data: rest };
    };

    /**
     * Activate account using a license key
     */
    activateLicense = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const validatedData = req.body as ActivateLicenseInput;

        const result = await this.authService.activateLicense(userId, validatedData.code);
        if (!result.success) {
            reply.status(result.code === 'BAD_REQUEST' ? 400 : 500);
            return result;
        }

        const isProd = process.env.NODE_ENV === 'production';
        
        reply.setCookie('wa_token', result.data.token, {
            httpOnly: true,
            secure: isProd,
            signed: true, // EXPLICITLY SIGN
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        const { token, ...rest } = result.data;
        return { success: true, data: rest };
    };

    /**
     * New User Registration
     */
    register = async (req: FastifyRequest, reply: FastifyReply) => {
        const validatedData = req.body as RegisterInput;
        const result = await this.authService.register(validatedData);

        if (!result.success) {
            reply.status(400);
            return result;
        }

        const isProd = process.env.NODE_ENV === 'production';

        reply.setCookie('wa_token', result.data.token, {
            httpOnly: true,
            secure: isProd,
            signed: true,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        reply.status(201);
        const { token, ...rest } = result.data;
        return { success: true, data: rest };
    };

    /**
     * Update current user profile
     */
    updateProfile = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const validatedData = req.body as UpdateProfileInput;
        
        const updateData: UpdateProfileInput = { ...validatedData };
        if (updateData.phoneNumber) {
            updateData.phoneNumber = formatPhone(updateData.phoneNumber);
        }

        const result = await this.userService.updateProfile(userId, updateData);
        if (!result.success) {
            reply.status(result.code === 'NOT_FOUND' ? 404 : 400);
            return result;
        }

        return result;
    };

    /**
     * Unlink Google Calendar
     */
    unlinkGoogle = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const result = await this.userService.unlinkGoogle(userId);
        if (!result.success) reply.status(500);
        return result;
    };

    /**
     * Unlink WhatsApp Number
     */
    unlinkPhone = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const result = await this.userService.unlinkPhone(userId);
        if (!result.success) reply.status(500);
        return result;
    };

    /**
     * Logout and Revoke Token
     */
    logout = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user?.id;
        const jti = req.user?.jti;

        if (userId) {
            await this.authService.logout(userId, jti);
        }

        const isProd = process.env.NODE_ENV === 'production';
        const isDev = process.env.NODE_ENV === 'development';

        reply.clearCookie('wa_token', {
            path: '/',
            httpOnly: true,
            secure: isProd || isDev,
            sameSite: isProd || isDev ? 'none' : 'lax'
        });

        return { success: true, message: 'Logged out' };
    };
}
