import { Queue } from 'bullmq';
import { env } from './config';
import prisma from '../modules/infra/prisma.service';

import { UserRepository } from '../modules/auth/user.repository';
import { ReminderRepository } from '../modules/reminders/reminder.repository';
import { CalendarRepository } from '../modules/reminders/calendar.repository';
import { UsageRepository } from '../modules/infra/usage.repository';
import { MessageRepository } from '../modules/whatsapp/message.repository';
import { RedisService } from '../modules/infra/redis.service';
import { EncryptionService } from '../modules/infra/encryption.service';
import { UsageService } from '../modules/infra/usage.service';
import { LiveService } from '../modules/whatsapp/live.service';

import { AuthService } from '../modules/auth/auth.service';
import { UserService } from '../modules/auth/user.service';
import { WhatsAppService } from '../modules/whatsapp/whatsapp.service';
import { MetaWhatsAppProvider } from '../modules/whatsapp/providers/meta.provider';
import { OTPService } from '../modules/whatsapp/otp.service';
import { MessageService } from '../modules/whatsapp/message.service';
import { ConversationService } from '../modules/whatsapp/conversation.service';
import { TemplateService } from '../modules/whatsapp/template.service';
import { CalendarService } from '../modules/reminders/calendar.service';
import { ReminderService } from '../modules/reminders/reminder.service';
import { GoogleCalendarProvider } from '../modules/reminders/google-calendar.provider';

import { AuthController } from '../modules/auth/auth.controller';
import { UserController } from '../modules/auth/user.controller';
import { ChatController } from '../modules/whatsapp/chat.controller';
import { ReminderController } from '../modules/whatsapp/reminder.controller';
import { OTPController } from '../modules/whatsapp/otp.controller';
import { WebhookController } from '../modules/whatsapp/webhook.controller';
import { HealthController } from '../modules/infra/health.controller';
import { UsageController } from '../modules/infra/usage.controller';
import { AdminMonitorController } from '../modules/infra/admin-monitor.controller';

class Container {
    private _encryptionService?: EncryptionService;
    get encryptionService() { return this._encryptionService ??= new EncryptionService(); }

    private _userRepository?: UserRepository;
    get userRepository() { return this._userRepository ??= new UserRepository(prisma, this.redisService, this.encryptionService); }

    private _reminderRepository?: ReminderRepository;
    get reminderRepository() { return this._reminderRepository ??= new ReminderRepository(prisma, this.redisService); }

    private _calendarRepository?: CalendarRepository;
    get calendarRepository() { return this._calendarRepository ??= new CalendarRepository(prisma); }

    private _usageRepository?: UsageRepository;
    get usageRepository() { return this._usageRepository ??= new UsageRepository(prisma); }

    private _messageRepository?: MessageRepository;
    get messageRepository() { return this._messageRepository ??= new MessageRepository(prisma); }

    private _redisService?: RedisService;
    get redisService() { return this._redisService ??= new RedisService(); }

    private _reminderQueue?: Queue;
    get reminderQueue() {
        return this._reminderQueue ??= new Queue('reminders', {
            connection: {
                url: env.REDIS_URL
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000 * 60 * 5, // 5 minutes
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        });
    }

    private _domainEventQueue?: Queue;
    get domainEventQueue() {
        return this._domainEventQueue ??= new Queue('domain-events', {
            connection: {
                url: env.REDIS_URL
            },
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        });
    }

    private _usageService?: UsageService;
    get usageService() { return this._usageService ??= new UsageService(this.usageRepository); }

    private _liveService?: LiveService;
    get liveService() { return this._liveService ??= new LiveService(); }

    private _messageService?: MessageService;
    get messageService() { return this._messageService ??= new MessageService(this.messageRepository, this.conversationService); }

    private _conversationService?: ConversationService;
    get conversationService() { return this._conversationService ??= new ConversationService(this.messageRepository); }

    private _messagingProvider?: MetaWhatsAppProvider;
    get messagingProvider() { return this._messagingProvider ??= new MetaWhatsAppProvider(); }

    private _templateService?: TemplateService;
    get templateService() { return this._templateService ??= new TemplateService(); }

    private _whatsappService?: WhatsAppService;
    get whatsappService() { 
        return this._whatsappService ??= new WhatsAppService(
            this.messagingProvider, 
            this.messageRepository, 
            this.conversationService
        ); 
    }

    private _googleCalendarProvider?: GoogleCalendarProvider;
    get googleCalendarProvider() { return this._googleCalendarProvider ??= new GoogleCalendarProvider(); }

    private _calendarService?: CalendarService;
    get calendarService() { return this._calendarService ??= new CalendarService(this.calendarRepository, this.redisService, this.whatsappService, this.googleCalendarProvider); }

    private _reminderService?: ReminderService;
    get reminderService() { return this._reminderService ??= new ReminderService(this.reminderRepository, this.reminderQueue); }

    private _otpService?: OTPService;
    get otpService() { return this._otpService ??= new OTPService(this.redisService, this.whatsappService, this.templateService, this.usageService); }

    private _authService?: AuthService;
    get authService() { return this._authService ??= new AuthService(this.userRepository, this.redisService, this.encryptionService); }

    private _userService?: UserService;
    get userService() { return this._userService ??= new UserService(this.userRepository, this.redisService, this.encryptionService); }

    private _authController?: AuthController;
    get authController() { return this._authController ??= new AuthController(this.authService, this.userService, this.userRepository); }

    private _userController?: UserController;
    get userController() { return this._userController ??= new UserController(this.userRepository, this.calendarService, this.reminderRepository); }

    private _chatController?: ChatController;
    get chatController() { return this._chatController ??= new ChatController(this.messageService); }

    private _reminderController?: ReminderController;
    get reminderController() { return this._reminderController ??= new ReminderController(this.reminderRepository, this.calendarService); }

    private _otpController?: OTPController;
    get otpController() { return this._otpController ??= new OTPController(this.otpService, this.userRepository); }

    private _webhookController?: WebhookController;
    get webhookController() { return this._webhookController ??= new WebhookController(this.whatsappService, this.messageRepository, this.userRepository); }

    private _healthController?: HealthController;
    get healthController() { return this._healthController ??= new HealthController(prisma, this.redisService, this.messagingProvider, this.calendarService, this.reminderQueue); }

    private _usageController?: UsageController;
    get usageController() { return this._usageController ??= new UsageController(this.usageService); }

    private _adminMonitorController?: AdminMonitorController;
    get adminMonitorController() { return this._adminMonitorController ??= new AdminMonitorController(this.messageRepository.prismaDb, this.reminderQueue); }
}

export const container = new Container();
