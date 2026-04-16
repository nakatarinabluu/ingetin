import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { logger } from '@ingetin/logger';

/**
 * Handle Auth-related events for internal side-effects.
 * NOTE: Critical operations (like usage logging) are handled DURABLY by DomainEventWorker.
 */
export class AuthSubscriber {
    static init() {
        eventBus.on(DomainEvent.USER_REGISTERED, async ({ userId }) => {
            logger.info({ msg: 'Local Listener: AuthSubscriber observed USER_REGISTERED', userId });
        });

        eventBus.on(DomainEvent.USER_ACTIVATED, async ({ userId, licenseId }) => {
            logger.info({ msg: 'Local Listener: AuthSubscriber observed USER_ACTIVATED', userId, licenseId });
        });
    }
}
