/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        div: {
          navy: {
            DEFAULT: '#102A56',
            dark: '#0A1B38',
            light: '#1B3B74',
            surface: '#152E5B'
          },
          saffron: {
            DEFAULT: '#E97820',
            dark: '#C86013',
            light: '#F48E3E',
            hover: '#D36A18'
          },
          gold: {
            DEFAULT: '#D5A63A',
            light: '#E6C065',
            dark: '#B08320'
          },
          linen: {
            DEFAULT: '#F8F5EF',
            card: '#FFFFFF',
            muted: '#EFEAE0',
            dark: '#E5DED0'
          },
          emerald: {
            DEFAULT: '#0D8259',
            light: '#10B981',
            bg: '#ECFDF5'
          },
          amber: {
            DEFAULT: '#D97706',
            light: '#F59E0B',
            bg: '#FFFBEB'
          },
          rose: {
            DEFAULT: '#DC2626',
            light: '#EF4444',
            bg: '#FEF2F2'
          }
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(16, 42, 86, 0.08), 0 4px 12px -4px rgba(16, 42, 86, 0.04)',
        'luxury-hover': '0 20px 40px -15px rgba(16, 42, 86, 0.15), 0 8px 20px -6px rgba(233, 120, 32, 0.12)',
        'gold-glow': '0 0 25px rgba(213, 166, 58, 0.25)',
        'card-subtle': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)'
      },
      borderRadius: {
        'luxury': '16px',
        'luxury-lg': '24px'
      }
    },
  },
  plugins: [],
}
