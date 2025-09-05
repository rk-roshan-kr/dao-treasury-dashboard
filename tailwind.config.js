/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        coolgray: '#1e293b',
        electric: '#a855f7',
        royal: '#F5BD02',
      },
      boxShadow: {
        card: '0 10px 20px rgba(15, 23, 42, 0.08)',
        hover: '0 14px 28px rgba(15, 23, 42, 0.12)'
      },
      borderRadius: {
        xl: '0.75rem'
      }
    }
  },
  plugins: []
}


