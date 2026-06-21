/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#c5a85c',
        'gold-hover': '#b39243',
        'gold-light': '#fbf7ef',
        'cream-soft': '#faf8f5',
        'cream-deep': '#f5eedf',
        charcoal: '#1c1a17',
        'charcoal-muted': '#4e4a43',
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "ui-serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}