/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Beige Minimalist Design System
        beigePrimary: "#FDFBF7",
        beigeSecondary: "#F4F1EA",
        beigeMuted: "#EAE6DB",
        charcoal: "#1A1A1A", // Neutral dark
        charcoalMuted: "#333333",
        charcoalDark: "#0F0F0F", // Deep neutral black
        terracotta: "#D96C4A",
        terracottaHover: "#C45B3A",
        sage: "#8B9681",
        
        textPrimary: "#2D2A26",
        textSecondary: "#7A756D",
        borderMuted: "#E8E2D6",
      },
      fontFamily: {
        outfit: ['"Outfit"', "sans-serif"],
        cormorant: ['"Cormorant Garamond"', "serif"],
        space: ['"Space Mono"', "monospace"],
        playfair: ['"Playfair Display"', "serif"],
        poppins: ['"Poppins"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 40px -15px rgba(180, 170, 150, 0.15)",
        warmHover: "0 30px 60px -15px rgba(180, 170, 150, 0.25)",
        darkDepth: "0 20px 40px -15px rgba(0, 0, 0, 0.4)",
        darkSoft: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
        darkHover: "0 30px 60px -15px rgba(0, 0, 0, 0.8)",
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};