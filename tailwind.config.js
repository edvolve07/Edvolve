const config = {
  content: [
    "./src/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        // Deep Emerald & Mint Tech Palette
        emerald: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#059669",  // Mint Green - primary actions, success, progress
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",  // Deep Emerald - sidebar, headings, primary buttons
          950: "#022c1f",
        },
        canvas: {
          DEFAULT: "#f4f7f6",  // Soft mint-gray background
          50:  "#f4f7f6",
          100: "#e8eceb",
          200: "#d1d5d3",
          300: "#a8adab",
        },
        card: {
          DEFAULT: "#ffffff",
          border: "#e5e7eb",
          shadow: "rgba(0, 0, 0, 0.04)",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
          800: "#064e3b",
          900: "#064e3b",
        },
        amber: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",  // Warm amber/gold - sparing highlights
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        slate: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      borderRadius: {
        'card': '10px',
        'card-lg': '12px',
        'card-sm': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)',
        'card-elevated': '0 8px 24px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.05)',
        'sidebar': '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.24)',
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "wave": "wave 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%":      { transform: "scaleY(1.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
