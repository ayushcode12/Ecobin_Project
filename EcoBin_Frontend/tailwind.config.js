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
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(360px)' },
        }
      },
      animation: {
        scan: 'scan 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
