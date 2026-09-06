/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          navy: '#0B172B',
          deep: '#102A56',
          saffron: '#E97820',
          gold: '#D5A63A',
          ivory: '#F8F5EF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Outfit', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'wearable-glow': '0 0 25px rgba(233, 120, 32, 0.25), 0 0 50px rgba(213, 166, 58, 0.15)',
        'oled-inset': 'inset 0 2px 10px rgba(0,0,0,0.8), inset 0 -2px 10px rgba(255,255,255,0.05)',
        'capsule-bevel': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'strobe-fast': 'strobe 0.6s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.25)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
        },
        strobe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
      },
    },
  },
  plugins: [],
}
