/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        losso: {
          cream: "#faf8f5",
          sand: "#f5f0e8",
          stone: "#1c1917",
          sage: "#166534",
          "sage-light": "#dcfce7",
          "sage-dark": "#14532d",
          muted: "#78716c",
        },
      },
    },
  },
  plugins: [],
};
