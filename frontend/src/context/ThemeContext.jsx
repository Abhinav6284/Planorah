import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const themeTransitionTimerRef = useRef(null);
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;

        return 'dark'; // Default to dark theme for all users
    });

    useEffect(() => {
        // Update document class and localStorage
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        return () => {
            if (themeTransitionTimerRef.current) {
                window.clearTimeout(themeTransitionTimerRef.current);
            }
        };
    }, []);

    const startThemeTransition = () => {
        const root = window.document.documentElement;
        const body = window.document.body;

        root.classList.add('theme-switching');
        body.classList.remove('theme-fade-transition');

        // Force reflow so repeated toggles can replay the fade animation.
        void body.offsetWidth;
        body.classList.add('theme-fade-transition');

        if (themeTransitionTimerRef.current) {
            window.clearTimeout(themeTransitionTimerRef.current);
        }

        themeTransitionTimerRef.current = window.setTimeout(() => {
            root.classList.remove('theme-switching');
            body.classList.remove('theme-fade-transition');
            themeTransitionTimerRef.current = null;
        }, 520);
    };

    const toggleTheme = () => {
        startThemeTransition();
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
