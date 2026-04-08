import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from './reminder.repository';
import { ReminderStatus } from '@prisma/client';

vi.mock('@ingetin/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

describe('ReminderService', () => {
    let service: ReminderService;
    let mockRepo: any;
    let mockQueue: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockRepo = {
            findDueReminders: vi.fn(),
            update: vi.fn(),
            updateStatus: vi.fn()
        };

        mockQueue = {
            add: vi.fn().mockResolvedValue({ id: 'job_id' })
        };

        service = new ReminderService(mockRepo as any, mockQueue as any);
    });

    it('should enqueue due reminders to BullMQ', async () => {
        const mockReminder = {
            id: 'rem_1',
            title: 'Test Reminder',
            message: 'Hello',
            schedule: new Date(Date.now() - 1000), // 1s ago
            userId: 'user_1',
            user: { username: 'testuser', phoneNumber: '+123456789' },
            repeat: 'NONE'
        };

        mockRepo.findDueReminders.mockResolvedValue([mockReminder]);

        await service.pushDueReminders();

        // 1. Check if status updated to QUEUED
        expect(mockRepo.update).toHaveBeenCalledWith('rem_1', expect.objectContaining({ status: 'QUEUED' }));

        // 2. Check if added to BullMQ
        expect(mockQueue.add).toHaveBeenCalledWith(
            'reminder-send',
            expect.objectContaining({
                reminderId: 'rem_1',
                title: 'Test Reminder'
            }),
            expect.any(Object)
        );
    });

    it('should drop and archive stale reminders', async () => {
        const staleDate = new Date(Date.now() - (2 * 60 * 60 * 1000)); // 2 hours ago (threshold is 1h)
        const mockReminder = {
            id: 'rem_stale',
            title: 'Stale Reminder',
            message: 'Late',
            schedule: staleDate,
            userId: 'user_1',
            user: { username: 'testuser', phoneNumber: '+123456789' },
            repeat: 'NONE'
        };

        mockRepo.findDueReminders.mockResolvedValue([mockReminder]);

        await service.pushDueReminders();

        // Should NOT be queued
        expect(mockQueue.add).not.toHaveBeenCalled();

        // Should be archived as FAILED
        expect(mockRepo.updateStatus).toHaveBeenCalledWith(
            'rem_stale',
            'FAILED',
            expect.any(Date)
        );
    });

    it('should drop reminders if user has no phone number', async () => {
        const mockReminder = {
            id: 'rem_no_phone',
            title: 'No Phone',
            message: 'No luck',
            schedule: new Date(),
            userId: 'user_1',
            user: { username: 'testuser', phoneNumber: null }, // No phone
            repeat: 'NONE'
        };

        mockRepo.findDueReminders.mockResolvedValue([mockReminder]);

        await service.pushDueReminders();

        expect(mockQueue.add).not.toHaveBeenCalled();
        expect(mockRepo.updateStatus).toHaveBeenCalledWith(
            'rem_no_phone',
            'FAILED',
            expect.any(Date)
        );
    });
});
