/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-border": "rgba(255, 255, 255, 0.18)",
        indigo: {
          500: "#6366F1",
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
