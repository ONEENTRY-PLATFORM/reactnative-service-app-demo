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

type ColorsType = {
  primary: string;
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
  primary: '#F60EFB',
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
