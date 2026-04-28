import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { sessionsService } from '../api/sessionsService';

export const useSessionsStore = create(
    devtools(
        (set, get) => ({
            sessions: [],
            remaining: { used: 0, limit: 0, remaining: 0, month: '' },
            notifications: [],
            isLoading: false,
            isSubmitting: false,
            error: null,

            fetchSessions: async () => {
                set({ isLoading: true, error: null }, false, 'sessionsStore/fetchSessions');
                try {
                    const [sessions, remaining, notifications] = await Promise.all([
                        sessionsService.listSessions(),
                        sessionsService.getRemaining(),
                        sessionsService.listNotifications(),
                    ]);
                    set({ sessions, remaining, notifications, isLoading: false }, false, 'sessionsStore/fetchSessions/success');
                } catch {
                    set({ isLoading: false, error: 'Failed to load sessions.' }, false, 'sessionsStore/fetchSessions/error');
                }
            },

            submitRequest: async (topicTags, description) => {
                set({ isSubmitting: true, error: null }, false, 'sessionsStore/submitRequest');
                try {
                    const newSession = await sessionsService.requestSession(topicTags, description);
                    set(
                        (state) => ({
                            sessions: [newSession, ...state.sessions],
                            remaining: {
                                ...state.remaining,
                                used: state.remaining.used + 1,
                                remaining: Math.max(0, state.remaining.remaining - 1),
                            },
                            isSubmitting: false,
                        }),
                        false,
                        'sessionsStore/submitRequest/success',
                    );
                    return { success: true };
                } catch (err) {
                    const message = err?.response?.data?.error || 'Failed to submit request.';
                    set({ isSubmitting: false, error: message }, false, 'sessionsStore/submitRequest/error');
                    return { success: false, error: message };
                }
            },

            markNotificationRead: async (id) => {
                await sessionsService.markNotificationRead(id);
                set(
                    (state) => ({
                        notifications: state.notifications.filter((n) => n.id !== id),
                    }),
                    false,
                    'sessionsStore/markNotificationRead',
                );
            },

            clearError: () => set({ error: null }, false, 'sessionsStore/clearError'),
        }),
        { name: 'sessionsStore' }
    )
);
