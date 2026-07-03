/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a7',
          300: '#f6b76d',
          400: '#f19134',
          500: '#ee7515',
          600: '#de5b0a',
          700: '#b74509',
          800: '#91380f',
          900: '#753010',
        },
      },
    },
  },
  plugins: [],
}
