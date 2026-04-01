/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        eco: {
          bg: '#040b1a',
          mint: '#22c98d',
          blue: '#4f8dff',
        },
      },
      boxShadow: {
        glass: '0 18px 34px rgba(3, 8, 20, 0.34)',
      },
    },
  },
  plugins: [],
};
