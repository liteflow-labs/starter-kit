const { white, black, blue, gray, green, red } = require('tailwindcss/colors')
/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  mode: 'jit',
  purge: [
    'node_modules/@nft/components/**/*.{js,ts,jsx,tsx}',
    'node_modules/@nft/templates/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      // [#55990B]
      // [#6CB310]
      // [rgba(10, 30, 66, 0.4)]
      white: white,
      black: black,
      blue: {
        50: blue[50],
        100: blue[100],
        300: blue[300],
        500: blue[500],
        600: blue[600],
      },
      brand: {
        100: '#D3E2FF',
        200: '#A7C4FF',
        500: '#245BFF',
        600: '#1A45DB',
        black: '#060F27',
      },
      gray: {
        100: gray[100],
        200: gray[200],
        300: gray[300],
        400: gray[400],
        500: gray[500],
        600: gray[600],
        700: gray[700],
        800: gray[800],
      },
      green: {
        50: green[50],
        300: green[300],
        500: green[500],
      },
      orange: {
        50: '#FFF7ED',
        300: '#FDBA74',
        500: '#F97316',
      },
      red: {
        50: red[50],
        100: red[100],
        300: red[300],
        500: red[500],
        900: red[900],
      },
    },
    extend: {
      flex: {
        full: '0 0 100%',
        '1/2': '0 0 50%',
        '1/3': '0 0 33.33%',
        '1/4': '0 0 25%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}
