/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        obs: {
          base:     '#080A0F',
          surface:  '#0F1117',
          elevated: '#161820',
          hover:    '#1C1F2A',
          border:   'rgba(255,255,255,0.06)',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          muted:   'rgba(245,158,11,0.12)',
          border:  'rgba(245,158,11,0.3)',
        },
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}
