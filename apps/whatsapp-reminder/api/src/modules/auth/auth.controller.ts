import { FastifyRequest, FastifyReply, RouteHandler, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifySchema, RouteGenericInterface } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { logger } from '@ingetin/logger';
import { UserRepository } from './user.repository';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { formatPhone } from '../../utils/phoneFormatter';
import { env } from '../../core/config';
import { 
    LoginInput, 
    RegisterInput, 
    ActivateLicenseInput, 
    UpdateProfileInput 
} from '@ingetin/types';
import { BadRequestError } from '../../core/errors/AppError';
import { GoogleAuthService } from '../reminders/google-auth.service';
import { CalendarService } from '../reminders/calendar.service';

type TypedHandler<T extends RouteGenericInterface = RouteGenericInterface> = RouteHandler<
    T, 
    RawServerDefault, 
    RawRequestDefaultExpression, 
    RawReplyDefaultExpression, 
    any, 
    FastifySchema, 
    ZodTypeProvider
>;

export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
        private readonly googleAuthService: GoogleAuthService,
        private readonly calendarService: CalendarService
    ) {}

    /**
     * Check if a username is available for registration
     */
    checkUsername: TypedHandler<{ Querystring: { username?: string } }> = async (req, reply) => {
        const { username } = req.query;
        
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
    login: TypedHandler<{ Body: LoginInput }> = async (req, reply) => {
        const result = await this.authService.login(req.body);

        if (!result.success) {
            if (result.code === 'LOCKED') reply.status(429);
            else if (result.code === 'UNAUTHORIZED') reply.status(401);
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

        const { token, ...rest } = result.data;
        return { success: true, data: rest };
    };

    /**
     * Activate account using a license key
     */
    activateLicense: TypedHandler<{ Body: ActivateLicenseInput }> = async (req, reply) => {
        const userId = req.user!.id;
        const result = await this.authService.activateLicense(userId, req.body.code);
        if (!result.success) {
            reply.status(result.code === 'BAD_REQUEST' ? 400 : 500);
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

        const { token, ...rest } = result.data;
        return { success: true, data: rest };
    };

    /**
     * New User Registration
     */
    register: TypedHandler<{ Body: RegisterInput }> = async (req, reply) => {
        const result = await this.authService.register(req.body);

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
    updateProfile: TypedHandler<{ Body: UpdateProfileInput }> = async (req, reply) => {
        const userId = req.user!.id;
        
        const updateData: UpdateProfileInput = { ...req.body };
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
     * Refresh Access Token using Refresh Token
     */
    refreshToken: TypedHandler<{ Body: { refreshToken: string } }> = async (req, reply) => {
        const result = await this.authService.refresh(req.body.refreshToken);
        if (!result.success) {
            return reply.status(401).send(result);
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

        return result;
    };

    /**
     * Terminate session
     */
    logout: TypedHandler = async (req, reply) => {
        const userId = req.user!.id;
        const jti = req.user!.jti;
        await this.authService.logout(userId, jti);
        
        reply.clearCookie('wa_token', { path: '/' });
        return reply.send({ success: true, message: 'Logged out' });
    };

    /**
     * Unlink WhatsApp Phone
     */
    unlinkPhone: TypedHandler = async (req, reply) => {
        const userId = req.user!.id;
        await this.userService.unlinkPhone(userId);
        return reply.send({ success: true, message: 'WhatsApp unlinked' });
    };

    /**
     * Unlink Google Calendar
     */
    unlinkGoogle: TypedHandler = async (req, reply) => {
        const userId = req.user!.id;
        await this.userService.unlinkGoogle(userId);
        return reply.send({ success: true, message: 'Google Calendar unlinked' });
    };

    /**
     * Initiate Google OAuth Flow
     */
    redirectToGoogle: TypedHandler = async (req, reply) => {
        const userId = req.user!.id;
        const url = await this.googleAuthService.getAuthUrl(userId);
        return reply.redirect(url);
    };

    /**
     * Handle Google OAuth Callback
     */
    handleGoogleCallback: TypedHandler<{ Querystring: { code?: string; state?: string } }> = async (req, reply) => {
        const { code, state } = req.query;
        const env_front = env.FRONTEND_URL;

        if (!code || !state) {
            return reply.redirect(`${env_front}/dashboard?calendar=error&message=Invalid_Callback`);
        }

        try {
            await this.googleAuthService.handleCallback(state, code);
            
            // Trigger an immediate sync after linking
            await this.calendarService.syncUserEvents(state);

            return reply.redirect(`${env_front}/dashboard?calendar=success`);
        } catch (error: unknown) {
            logger.error({ msg: 'Google Auth Error', error: ((error as Error).message) });
            return reply.redirect(`${env_front}/dashboard?calendar=error&message=${encodeURIComponent((error as Error).message)}`);
        }
    };
}
