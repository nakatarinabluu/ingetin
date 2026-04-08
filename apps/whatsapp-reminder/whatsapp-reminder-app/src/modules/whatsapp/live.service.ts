import { WebSocket } from 'ws';
import { logger } from '@ingetin/logger';
import Redis from 'ioredis';
import { env } from '../../core/config';

export enum LiveEvent {
    STATS_UPDATE = 'stats_update',
    PULSE_SIGNAL = 'pulse_signal',
    CHAT_UPDATE = 'chat_update',
    REMINDER_UPDATE = 'reminder_update'
}

export class LiveService {
    private clients: Set<WebSocket> = new Set();
    private pubClient: Redis;
    private subClient: Redis;
    private readonly CHANNEL = 'live_monitoring_channel';

    constructor() {
        this.pubClient = new Redis(env.REDIS_URL);
        this.subClient = new Redis(env.REDIS_URL);

        this.subClient.subscribe(this.CHANNEL, (err, count) => {
            if (err) {
                logger.error({ msg: 'Failed to subscribe to Redis Live channel', error: err.message });
            } else {
                logger.info({ msg: 'Subscribed to Redis Live channel', count });
            }
        });

        this.subClient.on('message', (channel, message) => {
            if (channel === this.CHANNEL) {
                this.pushToClients(message);
            }
        });
    }

    /**
     * Register a new WebSocket connection
     */
    addClient(socket: WebSocket) {
        this.clients.add(socket);
        logger.info({ msg: 'Live Monitoring: Node connected', active: this.clients.size });

        socket.on('close', () => {
            this.clients.delete(socket);
            logger.info({ msg: 'Live Monitoring: Node disconnected', active: this.clients.size });
        });

        // Basic ping-pong to keep connection alive
        socket.on('message', (message: any) => {
            if (message.toString() === 'ping') {
                socket.send('pong');
            }
        });
    }

    /**
     * Broadcast a message to all connected admin/client nodes via Redis
     */
    broadcast(event: LiveEvent, data: any) {
        const payload = JSON.stringify({ event, data, timestamp: new Date() });
        // Publish to Redis instead of sending directly, allowing all instances to receive it
        this.pubClient.publish(this.CHANNEL, payload);
    }

    /**
     * Push a raw message to locally connected clients
     */
    private pushToClients(payload: string) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
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
