import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { PulseEntry } from '../types';

/**
 * Advanced WebSocket Bridge for Admin Real-time Monitoring.
 * Encapsulates URL logic, token handling, and cache invalidation.
 */
export const useAdminMonitorBridge = () => {
    const queryClient = useQueryClient();
    const { session } = useAuth();
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        let wsUrl: string;

        // URL Protocol Resolution
        if (apiUrl.startsWith('http')) {
            const protocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
            const host = apiUrl.replace(/^https?:\/\//, '');
            wsUrl = `${protocol}//${host}/api/live`;
        } else {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            wsUrl = `${protocol}//${host}${apiUrl}/api/live`;
        }

        // Token Authentication via Query Param
        // In Fastify @fastify/websocket, this is a common way to pass auth for initial handshake
        if (session?.token) {
            wsUrl += `?token=${session.token}`;
        }

        try {
            const socket = new WebSocket(wsUrl);
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
                            queryClient.setQueryData(['admin-system-pulse'], (old: PulseEntry[] | undefined) => {
                                const currentData = Array.isArray(old) ? old : [];
                                return [data, ...currentData].slice(0, 100);
                            });
                            break;
                    }
                } catch (err) {
                    // Fail silently for parse errors to avoid crashing UI
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
