import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useWorkspaceStore = create(
  devtools(
    persist(
      (set) => ({
        // State
        sidebarOpen: true,
        currentSection: 'dashboard',
        theme: 'light',
        searchQuery: '',

        // Actions
        setSidebarOpen: (sidebarOpen) =>
          set({ sidebarOpen }, false, 'workspaceStore/setSidebarOpen'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'workspaceStore/toggleSidebar'
          ),

        setCurrentSection: (currentSection) =>
          set(
            { currentSection },
            false,
            'workspaceStore/setCurrentSection'
          ),

        setTheme: (theme) =>
          set({ theme }, false, 'workspaceStore/setTheme'),

        toggleTheme: () =>
          set(
            (state) => ({
              theme: state.theme === 'light' ? 'dark' : 'light',
            }),
            false,
            'workspaceStore/toggleTheme'
          ),

        setSearchQuery: (searchQuery) =>
          set({ searchQuery }, false, 'workspaceStore/setSearchQuery'),
      }),
      {
        name: 'workspace-storage',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
        }),
      }
    ),
    { name: 'workspaceStore' }
  )
);
