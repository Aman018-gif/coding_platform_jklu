/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Ubuntu", "system-ui", "sans-serif"],
      },
      colors: {
        codecampus: {
          dark: "#0f1419",
          card: "#1a2332",
          accent: "#facc15",
          muted: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
