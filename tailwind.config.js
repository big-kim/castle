/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A2A6C', // Prestige Blue
          50: '#F0F2FF',
          100: '#E0E6FF',
          500: '#1A2A6C',
          600: '#152356',
          700: '#101C41',
          800: '#0B152C',
          900: '#060E17',
        },
        secondary: {
          DEFAULT: '#D4AF37', // Royal Gold
          50: '#FDF9E7',
          100: '#FBF3CF',
          500: '#D4AF37',
          600: '#B8962F',
          700: '#9C7D27',
          800: '#80641F',
          900: '#644B17',
        },
        accent: {
          green: '#28A745', // Vital Green
          red: '#DC3545', // Warning Red
        },
        text: {
          main: '#212529',
          secondary: '#6C757D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          gray: '#F8F9FA',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        'pill': '9999px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};
