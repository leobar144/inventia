/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors INVENTIA
        primary: {
          50: '#f0f9f0',
          100: '#d9f0dd',
          200: '#b3e1be',
          300: '#7dc899',
          400: '#4aad76',
          500: '#2e9655', // Main green
          600: '#228542',
          700: '#1a6633',
          800: '#134729',
          900: '#0d2e1d',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#eaeef5',
          200: '#d4dde8',
          300: '#b8cde0',
          400: '#7fa5c9',
          500: '#4680b3', // Main blue
          600: '#2f5a99',
          700: '#1e3a66',
          800: '#142a4d',
          900: '#0c1a33',
        },
        accent: {
          50: '#fef8f0',
          100: '#fce4c0',
          200: '#f9c982',
          300: '#f5ad48',
          400: '#f29014',
          500: '#e67e22', // Main orange
          600: '#d66e1a',
          700: '#b85a14',
          800: '#944a10',
          900: '#703a0c',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['var(--font-heading)', 'Fraunces', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
