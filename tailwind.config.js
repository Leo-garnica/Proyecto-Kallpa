/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          400: '#a78bfa',
          600: '#7c3aed',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        success: {
          50:  '#ecfdf5',
          600: '#059669',
          800: '#047857',
        },
        warn: {
          50:  '#fffbeb',
          600: '#d97706',
          800: '#92400e',
        },
        danger: {
          50:  '#fef2f2',
          600: '#dc2626',
          800: '#991b1b',
        },
      },
    },
  },
  plugins: [],
}
