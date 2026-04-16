import { WebSocket } from 'ws';
import { logger } from '@ingetin/logger';
import Redis from 'ioredis';
import { env } from '../../core/config';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';

export enum LiveEvent {
    STATS_UPDATE = 'stats_update',
    PULSE_SIGNAL = 'pulse_signal',
    CHAT_UPDATE = 'chat_update',
    REMINDER_UPDATE = 'reminder_update'
}

export class LiveService {
    private readonly CHANNEL = 'live_monitoring_channel';
    private pubClient: Redis;
    private subClient: Redis;
    private sockets: Map<string, WebSocket> = new Map();

    constructor() {
        this.pubClient = new Redis(env.REDIS_URL);
        this.subClient = new Redis(env.REDIS_URL);

        this.setupRedisListener();
        this.registerEventBridge();
        this.startHeartbeat();
    }

    private startHeartbeat() {
        setInterval(() => {
            this.broadcast(LiveEvent.PULSE_SIGNAL, { 
                status: 'ALIVE', 
                clientCount: this.sockets.size 
            });
        }, 10000);
    }

    private setupRedisListener() {
        this.subClient.subscribe(this.CHANNEL, (err) => {
            if (err) {
                logger.error({ msg: '[WS] Failed to subscribe to Redis', error: err.message });
            } else {
                logger.info({ msg: `[WS] Subscribed to Redis channel: ${this.CHANNEL}` });
            }
        });

        this.subClient.on('message', (channel, message) => {
            if (channel === this.CHANNEL) {
                logger.debug({ msg: '[WS] Received message from Redis', channel });
                this.pushToClients(message);
            }
        });
    }

    private registerEventBridge() {
        eventBus.on(DomainEvent.CHAT_MESSAGE_RECEIVED, (payload) => {
            logger.info({ msg: '[WS BRIDGE] Received CHAT_MESSAGE_RECEIVED', from: payload.from });
            this.broadcast(LiveEvent.CHAT_UPDATE, {
                phoneNumber: payload.from,
                body: payload.body,
                direction: 'INBOUND',
                timestamp: payload.timestamp
            });
        });

        eventBus.on(DomainEvent.MESSAGE_SENT, (payload) => {
            if (payload.type === 'notif') { // Only broadcast relevant chat notifs
                logger.info({ msg: '[WS BRIDGE] Received MESSAGE_SENT', to: payload.to });
                this.broadcast(LiveEvent.CHAT_UPDATE, {
                    phoneNumber: payload.to,
                    body: payload.body,
                    direction: 'OUTBOUND',
                    timestamp: payload.timestamp
                });
            }
        });
    }

    /**
     * Register a new WebSocket connection
     */
    addSocket(socket: WebSocket) {
        if (!socket) return;
        const id = Math.random().toString(36).substring(7);
        this.sockets.set(id, socket);
        logger.info({ msg: '[WS] New client connected', id, total: this.sockets.size });

        socket.on('close', () => {
            this.sockets.delete(id);
            logger.info({ msg: '[WS] Client disconnected', id, total: this.sockets.size });
        });

        // Basic ping-pong to keep connection alive
        socket.on('message', (message: Buffer | string) => {
            if (message.toString() === 'ping') {
                socket.send('pong');
            }
        });
    }

    /**
     * Broadcast a message to all connected admin/client nodes via Redis
     */
    broadcast(event: LiveEvent, data: Record<string, unknown>) {
        try {
            const payload = JSON.stringify({ 
                event, 
                data, 
                timestamp: new Date().toISOString() 
            });
            logger.info({ msg: `[WS BROADCAST] ${event}`, phoneNumber: data.phoneNumber || data.phone });
            
            // 1. Publish to Redis for horizontal scale (other instances)
            this.pubClient.publish(this.CHANNEL, payload);
            
            // 2. Also push to locally connected clients immediately for lower latency
            this.pushToClients(payload);
        } catch (err: unknown) {
            const error = err as Error;
            logger.error({ msg: '[WS] Broadcast failed', error: error.message });
        }
    }

    /**
     * Push a raw message to locally connected clients
     */
    private pushToClients(payload: string) {
        for (const [id, socket] of this.sockets) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        }
    }

    /**
     * Send a pulse signal directly
     */
    sendPulse(
        message: string, 
        status: 'INFO' | 'ERROR' | 'SUCCESS' = 'INFO',
        category: 'SENT' | 'RECEIVED' | 'SYSTEM' = 'SYSTEM'
    ) {
        this.broadcast(LiveEvent.PULSE_SIGNAL, { 
            message, 
            status, 
            category,
            time: new Date() 
        });
    }
}
