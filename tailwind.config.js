/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vise: {
          blue: '#4A90E2',
          purple: '#7B68EE',
          indigo: '#5856D6',
        },
        surface: {
          DEFAULT: '#F8F9FA',
          secondary: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E8EAED',
          light: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        myanmar: ['Pyidaungsu', 'Noto Sans Myanmar', 'sans-serif'],
      },
      borderRadius: {
        'vise': '12px',
      },
      boxShadow: {
        'vise': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'vise-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'vise-xl': '0 12px 32px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%)',
        'chart-gradient': 'linear-gradient(180deg, #4A90E2 0%, #A78BFA 100%)',
        'card-hover': 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
