import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Dashboard/Header';
import ChatWidget from './Assistant/ChatWidget';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-gray-900 transition-colors duration-200 font-sans flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
            <ChatWidget />
        </div>
    );
};

export default Layout;
