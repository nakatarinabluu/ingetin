import { EventEmitter } from 'events';
import { DomainEvent, EventPayloads } from '../../core/events';
import { logger } from '@ingetin/logger';
import { container } from '../../core/container';

class TypedEventEmitter extends EventEmitter {
    /**
     * Emit a domain event. 
     * In this production version, events are persisted to BullMQ 
     * before being distributed to local listeners.
     */
    emit(event: string | symbol, payload?: any): boolean {
        // Fire and forget durability push
        if (typeof event === 'string') {
            logger.info({ msg: `EVENT PERSISTING: ${event}`, payload });
            container.domainEventQueue.add(event, payload).catch((error: any) => {
                logger.error({ msg: `CRITICAL: Failed to persist domain event ${event}`, error: error.message, payload });
            });
        }
        
        return super.emit(event, payload);
    }

    emitDomainEvent<T extends DomainEvent>(event: T, payload: EventPayloads[T]): boolean {
        return this.emit(event as string, payload);
    }

    /**
     * Subscribe to a domain event with strictly typed handler
     */
    on<T extends DomainEvent>(event: T, listener: (payload: EventPayloads[T]) => void): this {
        return super.on(event as any, listener);
    }
}

export const eventBus = new TypedEventEmitter();
