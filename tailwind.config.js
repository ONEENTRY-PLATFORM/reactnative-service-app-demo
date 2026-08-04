/** @type {import('tailwindcss').Config} */
const {hairlineWidth} = require("nativewind/theme");
const {appColors} = require('./lib/constants/Colors');

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
        md: 2,
        sm: 1,
      },
      spacing: {
        layout: '20px',
      },
      colors: appColors,
      fontFamily: {
        // Wired in app/_layout.tsx via useFonts (@expo-google-fonts/*).
        // Falls back to the platform default until the fonts load.
        lato: ['Lato_400Regular'],
        'lato-light': ['Lato_300Light'],
        'lato-bold': ['Lato_700Bold'],
        'league-gothic': ['LeagueGothic_400Regular'],
      },
      keyframes: {
        zoom: {
          '0%, 100%': { transform: 'scale-1' },
          '50%': { transform: 'scale-1.1' },
        },
      },
      animation: {
        zoom: 'zoom 1s ease-in-out infinite',
      },
    },
    borderRadius: {
      none: '0',
      sm: '10px',
      md: '15px',
      lg: '20px',
      full: '9999px',
      xl: '30px',
      xs: '10px',
      xxs: '5px',
    },
  },
  plugins: [],
}

