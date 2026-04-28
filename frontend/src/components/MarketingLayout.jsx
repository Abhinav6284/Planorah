import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './shared/TopNav';
import { Footer } from './shared/Footer';

const MarketingLayout = () => {
  return (
    <div className="lp-page">
      <TopNav inApp={false} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
