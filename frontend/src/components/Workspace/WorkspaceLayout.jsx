import React, { Suspense } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import Sidebar from '../Sidebar';
import DashboardSkeleton from '../common/Skeleton';

// Lazy load section components
const DashboardView = React.lazy(() =>
  import('../Dashboard/Dashboard').catch(() => ({
    default: () => <div className="p-4">Dashboard not found</div>
  }))
);

const RoadmapView = React.lazy(() =>
  import('../Roadmap/RoadmapView').catch(() => ({
    default: () => <div className="p-4">Roadmap not found</div>
  }))
);

const BlockEditor = React.lazy(() =>
  import('../Editor/BlockEditor').catch(() => ({
    default: () => <div className="p-4">Block Editor not found</div>
  }))
);

// Placeholder component for settings
const SettingsPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600 dark:text-gray-400">Settings page coming soon</p>
  </div>
);

// Navbar placeholder component
const WorkspaceNavbar = ({ currentSection }) => (
  <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-6 sticky top-0 z-20">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
      {currentSection.replace('-', ' ')}
    </h2>
  </nav>
);

// MentorPanel placeholder component
const MentorPanelPlaceholder = () => (
  <div className="hidden lg:flex lg:w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-col">
    <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">AI Mentor</h3>
    </div>
    <div className="flex-1 p-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
      <p className="text-sm">Mentor panel loading...</p>
    </div>
  </div>
);

// Section component mapping
const SECTION_COMPONENTS = {
  dashboard: DashboardView,
  roadmap: RoadmapView,
  notes: BlockEditor,
  progress: DashboardView,
  settings: SettingsPlaceholder,
};

/**
 * WorkspaceLayout - Main container orchestrating workspace structure
 *
 * Layout:
 * [Sidebar] | [Navbar + MainContent + MentorPanel]
 *
 * Handles:
 * - User authentication state
 * - Section routing via currentSection from store
 * - Loading states during auth
 * - Suspense boundaries for code-split components
 */
const WorkspaceLayout = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const currentSection = useWorkspaceStore((state) => state.currentSection);

  // Get the component for current section
  const SectionComponent = SECTION_COMPONENTS[currentSection] || DashboardView;

  // Show loading spinner while user is being fetched
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <DashboardSkeleton />
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Please log in
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to access the workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-gray-950 flex">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Navbar */}
        <WorkspaceNavbar currentSection={currentSection} />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<DashboardSkeleton />}>
            <SectionComponent />
          </Suspense>
        </main>
      </div>

      {/* Mentor Panel */}
      <MentorPanelPlaceholder />
    </div>
  );
};

export default WorkspaceLayout;
