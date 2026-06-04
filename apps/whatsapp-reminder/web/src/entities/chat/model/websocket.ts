import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveWsUrl } from '@/shared/lib/api.utils';

export enum LiveEvent {
    STATS_UPDATE = 'stats_update',
    PULSE_SIGNAL = 'pulse_signal',
    CHAT_UPDATE = 'chat_update',
    REMINDER_UPDATE = 'reminder_update'
}

export interface WSPayload<T = unknown> {
    event: LiveEvent;
    data: T;
    timestamp: string;
}

export const useWebSocket = (onMessage?: (payload: WSPayload) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCountRef = useRef(0);
    const onMessageRef = useRef(onMessage);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = resolveWsUrl('/api/whatsapp/ws');
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setIsConnected(true);
            retryCountRef.current = 0; // Reset backoff on success
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data) as WSPayload<unknown>;
                if (onMessageRef.current) onMessageRef.current(payload);
            } catch (err) {
                console.error('[WS] Failed to parse message:', err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            // Exponential Backoff: 1s, 2s, 4s, 8s... max 30s
            const backoffMs = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
            retryCountRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(connect, backoffMs);
        };

        ws.onerror = (err) => {
            console.error('[WS] Error:', err);
            ws.close();
        };

        socketRef.current = ws;
    }, []); // No longer depends on onMessage

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) {
                socketRef.current.onclose = null; // Prevent reconnect on intentional close
                socketRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((msg: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(msg);
        }
    }, []);

    return { isConnected, sendMessage };
};
