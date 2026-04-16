import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { logger } from '@ingetin/logger';
import { Reminder } from '@prisma/client';

export class ReminderSubscriber {
    static init() {
        /**
         * NOTE: Critical scheduling is now handled DURABLY by the DomainEventWorker (BullMQ).
         * This local subscriber is only for lightweight, non-critical local side effects
         * that don't need to be persisted if the process crashes.
         */
        eventBus.on(DomainEvent.REMINDER_CREATED, async (payload: { reminderId: string }) => {
            logger.info({ msg: 'Local Listener: New reminder detected', id: payload.reminderId });
        });

        eventBus.on(DomainEvent.REMINDER_UPDATED, async (payload: { reminderId: string }) => {
            logger.info({ msg: 'Local Listener: Reminder update detected', id: payload.reminderId });
        });
    }
}
