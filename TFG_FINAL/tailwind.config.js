const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
        colors: {
            amber: colors.amber,
            'Tronja': '#B54F14',
            'Tronja-clar': '#FF6F1C',
            'Groc': '#ABA815',
            'Groc-clar': '#DBD81A',
            'Blau': '#182745',
            'Blau-clar': '#2F4D87',
            'Verd': '#6EC228',
            'Verd-clar': '#9BD64D'


        }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
