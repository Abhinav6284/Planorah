/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Cal.com inspired typography system
        'cal-sans': ['Cal Sans', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Monochromatic Cal.com-inspired palette
        charcoal: '#242424',  // Primary heading and button text
        midnight: '#111111',  // Deep text/overlay color
        'mid-gray': '#898989', // Secondary text
        'border-gray': 'rgba(34, 42, 53, 0.08)', // Shadow-based borders
        'link-blue': '#0099ff', // Link color
        'focus-blue': 'rgba(59, 130, 246, 0.5)', // Focus ring
        // Legacy obs/gold for backward compatibility
        obs: {
          base: '#ffffff',
          surface: '#ffffff',
          elevated: '#ffffff',
          hover: 'rgba(0,0,0,0.04)',
          border: 'rgba(34, 42, 53, 0.08)',
        },
        gold: {
          DEFAULT: '#0099ff',
          light: '#0099ff',
          muted: 'rgba(0, 153, 255, 0.12)',
          border: 'rgba(0, 153, 255, 0.3)',
        },
      },
      spacing: {
        // 8px base unit system
        'xs': '1px',
        'sm': '2px',
        'md': '4px',
        'base': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '20px',
        '3xl': '24px',
        '4xl': '28px',
        'section': '80px',
      },
      borderRadius: {
        // Cal.com border radius scale
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '29px',
        'full': '100px',
        'pill': '9999px',
      },
      boxShadow: {
        // Cal.com sophisticated multi-layered shadow system
        'none': 'none',
        'level-1-inset': 'rgba(0,0,0,0.16) 0px 1px 1.9px 0px inset',
        'level-2-card': 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px',
        'level-2-alt': 'rgba(36,36,36,0.7) 0px 1px 5px -4px, rgba(36,36,36,0.05) 0px 4px 8px',
        'level-3-soft': 'rgba(34,42,53,0.05) 0px 4px 8px',
        'level-4-highlight': 'rgba(255,255,255,0.15) 0px 2px 0px inset',
        'sm': 'rgba(19,19,22,0.5) 0px 1px 3px -2px',
        'md': 'rgba(19,19,22,0.6) 0px 2px 6px -2px',
        'lg': 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}
