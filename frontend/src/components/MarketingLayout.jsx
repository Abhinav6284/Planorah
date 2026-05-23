import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './shared/TopNav';
import { Footer } from './shared/Footer';
import { useTheme } from '../context/ThemeContext';

const MarketingLayout = () => {
  const { theme } = useTheme();

  return (
    <div className="lp-page" key={theme}>
      <TopNav inApp={false} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
