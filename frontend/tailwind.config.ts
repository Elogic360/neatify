import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6600',
        secondary: '#232f3e',
      },
    },
  },
  plugins: [],
} satisfies Config