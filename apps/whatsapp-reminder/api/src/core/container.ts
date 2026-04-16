import { Queue } from 'bullmq';
import { bullConnection } from './bull-connection';
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

import { FinanceRepository } from '../modules/finances/finance.repository';
import { FinanceService } from '../modules/finances/finance.service';
import { GeminiService } from '../modules/finances/gemini.service';
import { GoogleAuthService } from '../modules/reminders/google-auth.service';

import { AuthController } from '../modules/auth/auth.controller';
import { UserController } from '../modules/auth/user.controller';
import { ChatController } from '../modules/whatsapp/chat.controller';
import { ReminderController } from '../modules/reminders/reminder.controller';
import { OTPController } from '../modules/whatsapp/otp.controller';
import { WebhookController } from '../modules/whatsapp/webhook.controller';
import { HealthController } from '../modules/infra/health.controller';
import { UsageController } from '../modules/infra/usage.controller';
import { AdminMonitorController } from '../modules/infra/admin-monitor.controller';
import { FinanceController } from '../modules/finances/finance.controller';

class Container {
    private _encryptionService?: EncryptionService;
    get encryptionService() {
        if (!this._encryptionService) this._encryptionService = new EncryptionService();
        return this._encryptionService;
    }

    private _redisService?: RedisService;
    get redisService() {
        if (!this._redisService) this._redisService = new RedisService();
        return this._redisService;
    }

    private _liveService?: LiveService;
    get liveService() {
        if (!this._liveService) this._liveService = new LiveService();
        return this._liveService;
    }

    private _userRepository?: UserRepository;
    get userRepository() {
        if (!this._userRepository) this._userRepository = new UserRepository(prisma, this.redisService, this.encryptionService);
        return this._userRepository;
    }

    private _reminderRepository?: ReminderRepository;
    get reminderRepository() {
        if (!this._reminderRepository) this._reminderRepository = new ReminderRepository(prisma, this.redisService);
        return this._reminderRepository;
    }

    private _calendarRepository?: CalendarRepository;
    get calendarRepository() {
        if (!this._calendarRepository) this._calendarRepository = new CalendarRepository(prisma);
        return this._calendarRepository;
    }

    private _usageRepository?: UsageRepository;
    get usageRepository() {
        if (!this._usageRepository) this._usageRepository = new UsageRepository(prisma);
        return this._usageRepository;
    }

    private _messageRepository?: MessageRepository;
    get messageRepository() {
        if (!this._messageRepository) this._messageRepository = new MessageRepository(prisma);
        return this._messageRepository;
    }

    private _financeRepository?: FinanceRepository;
    get financeRepository() {
        if (!this._financeRepository) this._financeRepository = new FinanceRepository(prisma);
        return this._financeRepository;
    }

    private _usageService?: UsageService;
    get usageService() {
        if (!this._usageService) this._usageService = new UsageService(this.usageRepository);
        return this._usageService;
    }

    private _geminiService?: GeminiService;
    get geminiService() {
        if (!this._geminiService) this._geminiService = new GeminiService();
        return this._geminiService;
    }

    private _financeService?: FinanceService;
    get financeService() {
        if (!this._financeService) this._financeService = new FinanceService(this.financeRepository, this.geminiService);
        return this._financeService;
    }

    private _financeController?: FinanceController;
    get financeController() {
        if (!this._financeController) this._financeController = new FinanceController(this.financeService, this.financeRepository);
        return this._financeController;
    }

    private _conversationService?: ConversationService;
    get conversationService() {
        if (!this._conversationService) this._conversationService = new ConversationService(this.messageRepository);
        return this._conversationService;
    }

    private _messageService?: MessageService;
    get messageService() {
        if (!this._messageService) this._messageService = new MessageService(this.messageRepository, this.conversationService);
        return this._messageService;
    }

    private _authService?: AuthService;
    get authService() {
        if (!this._authService) this._authService = new AuthService(this.userRepository, this.redisService, this.encryptionService);
        return this._authService;
    }

    private _userService?: UserService;
    get userService() {
        if (!this._userService) this._userService = new UserService(this.userRepository, this.redisService, this.encryptionService);
        return this._userService;
    }

    private _messagingProvider?: MetaWhatsAppProvider;
    get messagingProvider() {
        if (!this._messagingProvider) this._messagingProvider = new MetaWhatsAppProvider();
        return this._messagingProvider;
    }

    private _templateService?: TemplateService;
    get templateService() {
        if (!this._templateService) this._templateService = new TemplateService();
        return this._templateService;
    }

    private _whatsappService?: WhatsAppService;
    get whatsappService() {
        if (!this._whatsappService) this._whatsappService = new WhatsAppService(this.messagingProvider, this.messageRepository, this.conversationService);
        return this._whatsappService;
    }

    private _googleCalendarProvider?: GoogleCalendarProvider;
    get googleCalendarProvider() {
        if (!this._googleCalendarProvider) this._googleCalendarProvider = new GoogleCalendarProvider();
        return this._googleCalendarProvider;
    }

    private _calendarService?: CalendarService;
    get calendarService() {
        if (!this._calendarService) this._calendarService = new CalendarService(this.calendarRepository, this.redisService, this.whatsappService, this.googleCalendarProvider);
        return this._calendarService;
    }

    private _googleAuthService?: GoogleAuthService;
    get googleAuthService() {
        if (!this._googleAuthService) this._googleAuthService = new GoogleAuthService(this.calendarRepository, this.redisService, this.googleCalendarProvider);
        return this._googleAuthService;
    }

    private _reminderService?: ReminderService;
    get reminderService() {
        if (!this._reminderService) this._reminderService = new ReminderService(this.reminderRepository, this.reminderQueue);
        return this._reminderService;
    }

    private _otpService?: OTPService;
    get otpService() {
        if (!this._otpService) this._otpService = new OTPService(this.redisService, this.whatsappService, this.templateService, this.usageService);
        return this._otpService;
    }

    private _authController?: AuthController;
    get authController() {
        if (!this._authController) this._authController = new AuthController(this.authService, this.userService, this.userRepository, this.googleAuthService, this.calendarService);
        return this._authController;
    }

    private _userController?: UserController;
    get userController() {
        if (!this._userController) this._userController = new UserController(this.userService, this.userRepository, this.calendarService, this.reminderRepository);
        return this._userController;
    }

    private _chatController?: ChatController;
    get chatController() {
        if (!this._chatController) this._chatController = new ChatController(this.messageService);
        return this._chatController;
    }

    private _reminderController?: ReminderController;
    get reminderController() {
        if (!this._reminderController) this._reminderController = new ReminderController(this.reminderRepository, this.reminderService, this.calendarService);
        return this._reminderController;
    }

    private _otpController?: OTPController;
    get otpController() {
        if (!this._otpController) this._otpController = new OTPController(this.otpService, this.userService);
        return this._otpController;
    }

    private _webhookController?: WebhookController;
    get webhookController() {
        if (!this._webhookController) this._webhookController = new WebhookController(this.redisService, this.whatsappService);
        return this._webhookController;
    }

    private _healthController?: HealthController;
    get healthController() {
        if (!this._healthController) this._healthController = new HealthController(prisma, this.redisService, this.messagingProvider, this.calendarService, this.reminderQueue);
        return this._healthController;
    }

    private _usageController?: UsageController;
    get usageController() {
        if (!this._usageController) this._usageController = new UsageController(this.usageService);
        return this._usageController;
    }

    private _adminMonitorController?: AdminMonitorController;
    get adminMonitorController() {
        if (!this._adminMonitorController) this._adminMonitorController = new AdminMonitorController(prisma, this.reminderQueue);
        return this._adminMonitorController;
    }

    private _reminderQueue?: Queue;
    get reminderQueue() {
        if (!this._reminderQueue) this._reminderQueue = new Queue('reminder-jobs', { connection: bullConnection });
        return this._reminderQueue;
    }

    private _domainEventQueue?: Queue;
    get domainEventQueue() {
        if (!this._domainEventQueue) this._domainEventQueue = new Queue('domain-events', { connection: bullConnection });
        return this._domainEventQueue;
    }
}

export const container = new Container();
