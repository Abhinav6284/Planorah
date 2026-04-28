import React, { useEffect } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const ThemeProvider = ({ children }) => {
  const theme = useWorkspaceStore((state) => state.theme);

  useEffect(() => {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
