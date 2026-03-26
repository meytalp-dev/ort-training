/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7F4',
          100: '#E8F4F0',
          200: '#D1E9E0',
          300: '#A8D8C8',
          400: '#7BC4AD',
          500: '#4BA68C',
          600: '#3D8B75',
          sage: '#A8B5A0',
          beige: '#F5F0E8',
          cream: '#FFFBF5',
          sky: '#E0EFF6',
          mist: '#F0F4F8',
        },
      },
      fontFamily: {
        heading: ['Heebo', 'sans-serif'],
        body: ['Heebo', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
