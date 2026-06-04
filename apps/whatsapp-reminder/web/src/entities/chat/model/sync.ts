import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthContext';
import { resolveWsUrl } from '@/shared/lib/api.utils';
import type { PulseEntry } from '@ingetin/types';

/**
 * Advanced WebSocket Bridge for Admin Real-time Monitoring.
 * Encapsulates URL logic, token handling, and cache invalidation.
 */
export const useChatSync = () => {
    const queryClient = useQueryClient();
    const { session } = useAuth();
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bufferRef = useRef<any[]>([]);
    const flushRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        const wsUrl = resolveWsUrl('/api/live');

        try {
            // Token Authentication via Sub-Protocol (More Secure, won't appear in URL logs)
            const protocols = session?.token ? ['access_token', session.token] : undefined;
            const socket = new WebSocket(wsUrl, protocols);
            socketRef.current = socket;

            socket.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    const { event: type, data } = payload;

                    switch (type) {
                        case 'stats_update':
                            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                            break;
                        
                        case 'chat_update':
                            queryClient.invalidateQueries({ queryKey: ['conversations'] });
                            queryClient.invalidateQueries({ queryKey: ['messages'] });
                            break;
                        
                        case 'pulse_signal':
                            bufferRef.current.push(data);
                            if (!flushRef.current) {
                                flushRef.current = setTimeout(() => {
                                    queryClient.setQueryData(['admin-system-pulse'], (old: PulseEntry[] | undefined) => {
                                        const currentData = Array.isArray(old) ? old : [];
                                        const newData = [...bufferRef.current, ...currentData].slice(0, 100);
                                        bufferRef.current = [];
                                        return newData;
                                    });
                                    flushRef.current = null;
                                }, 1000);
                            }
                            break;
                    }
                } catch (err) {
                    if (import.meta.env.DEV) {
                        console.error('[WS] Message parse error:', err, event.data);
                    }
                }
            };

            socket.onclose = () => {
                socketRef.current = null;
                reconnectTimerRef.current = setTimeout(connect, 5000);
            };

            socket.onerror = () => {
                socket.close();
            };

        } catch (err) {
            reconnectTimerRef.current = setTimeout(connect, 5000);
        }
    }, [queryClient, session?.token]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.close();
            }
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
    }, [connect]);

    return {
        isConnected: !!socketRef.current && socketRef.current.readyState === WebSocket.OPEN
    };
};
