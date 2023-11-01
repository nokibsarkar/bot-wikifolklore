/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fonts : {
        primary : ['"Playfair Display']
      },
      colors : {
        primary : 'rgb(0,102,153)',
        secondary : 'rgb(153, 0, 0)',
        fadedGreen : 'rgb(51 153 102)'
      }
    },
  },
  plugins: [],
}