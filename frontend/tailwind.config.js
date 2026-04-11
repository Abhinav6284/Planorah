/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design System Accent Colors
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#4f46e5",
          900: "#312e81",
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          900: "#1e3a8a",
        },

        // Semantic Colors
        success: {
          50: "#d1fae5",
          500: "#10b981",
          700: "#047857",
        },
        warning: {
          50: "#fef3c7",
          500: "#f59e0b",
          700: "#d97706",
        },
        error: {
          50: "#fee2e2",
          500: "#ef4444",
          700: "#dc2626",
        },

        // Beige Minimalist Design System (preserved for backward compatibility)
        beigePrimary: "#FDFBF7",
        beigeSecondary: "#F4F1EA",
        beigeMuted: "#EAE6DB",
        charcoal: "#1A1A1A",
        charcoalMuted: "#333333",
        charcoalDark: "#0F0F0F",
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

      fontSize: {
        // Typography system
        h1: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],     // 32px
        h2: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }], // 20px
        h3: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }], // 18px
        body: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],   // 16px
        sm: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }], // 14px
      },

      borderRadius: {
        lg: "0.5rem",  // 8px
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
      },

      boxShadow: {
        // Refined shadow system
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",

        // Preserved custom shadows for backward compatibility
        soft: "0 20px 40px -15px rgba(180, 170, 150, 0.15)",
        warmHover: "0 30px 60px -15px rgba(180, 170, 150, 0.25)",
        darkDepth: "0 20px 40px -15px rgba(0, 0, 0, 0.4)",
        darkSoft: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
        darkHover: "0 30px 60px -15px rgba(0, 0, 0, 0.8)",
      },

      animation: {
        // Smooth transitions for interactive elements
        "fade-in": "fadeIn 200ms ease-in-out forwards",
        "fade-out": "fadeOut 200ms ease-in-out forwards",
        "slide-up": "slideUp 250ms ease-out forwards",
        "scale-in": "scaleIn 200ms ease-out forwards",

        // Preserved animations for backward compatibility
        'blob': 'blob 7s infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },

        // Preserved keyframes for backward compatibility
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
      },

      spacing: {
        // 4px grid base (Tailwind standard already provides this)
        // Additional custom spacing if needed
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};