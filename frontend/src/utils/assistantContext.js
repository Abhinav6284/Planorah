export const getContextSourceFromPath = (pathname = '') => {
  if (pathname.startsWith('/roadmap')) return 'roadmap';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/scheduler')) return 'scheduler';
  if (pathname.startsWith('/resume')) return 'resume';
  if (pathname.startsWith('/lab')) return 'lab';
  if (pathname.startsWith('/ats')) return 'ats';
  if (pathname.startsWith('/jobs')) return 'jobs';
  if (pathname.startsWith('/interview')) return 'interview';
  if (pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/planora')) return 'planora';
  if (pathname.startsWith('/assistant')) return 'assistant';
  return 'general';
};

export const buildFrontendAssistantContext = ({
  pathname = '',
  selectedIds = {},
  visiblePanel = '',
  uiState = {},
  activeTab = '',
  metadata = {},
} = {}) => ({
  path: pathname || (typeof window !== 'undefined' ? window.location.pathname : ''),
  context_source: getContextSourceFromPath(pathname || (typeof window !== 'undefined' ? window.location.pathname : '')),
  selected_ids: selectedIds,
  visible_panel: visiblePanel,
  ui_state: uiState,
  active_tab: activeTab,
  metadata,
});

