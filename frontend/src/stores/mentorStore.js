import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useMentorStore = create(
  devtools(
    (set, get) => ({
      // State
      messages: [],
      isLoading: false,
      isMinimized: false,
      expandMode: 'default', // 'default' | 'larger' | 'fullscreen' | 'newtab'
      currentContext: '',
      quickActions: [],

      // Actions
      addMessage: (message) =>
        set(
          (state) => ({
            messages: [
              ...state.messages,
              {
                ...message,
                id: message.id || `msg-${Date.now()}-${Math.random()}`,
                timestamp: message.timestamp || new Date().toISOString(),
              },
            ],
          }),
          false,
          'mentorStore/addMessage'
        ),

      setMessages: (messages) =>
        set({ messages }, false, 'mentorStore/setMessages'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'mentorStore/setLoading'),

      setMinimized: (isMinimized) =>
        set({ isMinimized }, false, 'mentorStore/setMinimized'),

      toggleMinimized: () =>
        set(
          (state) => ({ isMinimized: !state.isMinimized }),
          false,
          'mentorStore/toggleMinimized'
        ),

      cycleExpandMode: () =>
        set(
          (state) => {
            const modes = ['default', 'larger', 'fullscreen', 'newtab'];
            const currentIndex = modes.indexOf(state.expandMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            return { expandMode: modes[nextIndex] };
          },
          false,
          'mentorStore/cycleExpandMode'
        ),

      setContext: (currentContext) =>
        set({ currentContext }, false, 'mentorStore/setContext'),

      clearMessages: () =>
        set(
          { messages: [] },
          false,
          'mentorStore/clearMessages'
        ),

      setQuickActions: (quickActions) =>
        set({ quickActions }, false, 'mentorStore/setQuickActions'),
    }),
    { name: 'mentorStore' }
  )
);
