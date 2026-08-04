// Legacy tokens kept for expo template compat; nothing in the app uses these.
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

// Brand palette, aligned with apps/nextjs-beauty. Each new token maps to the
// same hex as the web (see WEB_PARITY_PLAN.md § "Этап 1"). Legacy tokens
// (blue/green/orange) stay for now — they are still referenced in a handful of
// components and will be replaced with the accent tokens as we touch those files.
type ColorsType = {
  // Brand
  primary: string;
  primaryStrong: string;
  // Accents
  cyanAccent: string;
  cyanAccentLight: string;
  purpleAccent: string;
  purpleAccentSoft: string;
  // Text
  ink: string;
  charcoal: string;
  // Surfaces & borders
  slate150: string;
  slate200: string;
  // Legacy / kept for compat
  lightGray: string;
  gray: string;
  dark: string;
  blue: string;
  green: string;
  orange: string;
  white: string;
  black: string;
  red: string;
};

export const appColors: ColorsType = {
  // Brand — primary matches web fuchsia-450 (already established in RN);
  // primaryStrong = web fuchsia-500, use where a punchier accent is required.
  primary: '#F60EFB',
  primaryStrong: '#ed21f1',

  // Accents from web design system.
  cyanAccent: '#109aa9',
  cyanAccentLight: '#26d2e6',
  purpleAccent: '#9b4fb2',
  purpleAccentSoft: '#7e63ae',

  // Text tokens (replace ad-hoc greys as components are touched).
  ink: '#414253',
  charcoal: '#292a2c',

  // Surfaces and borders.
  slate150: '#e8e8f0',
  slate200: '#cbd5e1',

  // Legacy — do not use in new code.
  lightGray: '#EEEFF0',
  gray: '#A8A9B5',
  dark: '#4C4D56',
  blue: '#0EDEFB',
  green: '#25D4A0',
  orange: '#FB7F0E',
  white: '#FFFFFF',
  black: '#0e0e0e',
  red: '#f33d38',
};
