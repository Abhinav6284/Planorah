import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) =>
          set(
            { user, isAuthenticated: !!user },
            false,
            'authStore/setUser'
          ),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'authStore/setLoading'),

        setError: (error) =>
          set({ error }, false, 'authStore/setError'),

        logout: () =>
          set(
            {
              user: null,
              isAuthenticated: false,
              error: null,
            },
            false,
            'authStore/logout'
          ),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'authStore' }
  )
);
