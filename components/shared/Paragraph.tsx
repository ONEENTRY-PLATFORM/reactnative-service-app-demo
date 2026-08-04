import {StyleProp, TextProps, TextStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import {appColors} from '@/lib/constants/Colors';

// Font families are loaded once in app/_layout.tsx via @expo-google-fonts/*.
// `family` selects one of them; specific Lato weight is derived from `weight`.
export type ParagraphFontFamily = 'lato' | 'league-gothic';

export type ParagraphProps = TextProps & {
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: keyof typeof appColors;
  family?: ParagraphFontFamily;
};

function resolveFontFamily(
  family: ParagraphFontFamily,
  weight: TextStyle['fontWeight'] | undefined,
): string | undefined {
  if (family === 'league-gothic') {
    return 'LeagueGothic_400Regular';
  }
  const w = typeof weight === 'string' ? Number(weight) : weight;
  if (w && w <= 300) return 'Lato_300Light';
  if (w && w >= 700) return 'Lato_700Bold';
  return 'Lato_400Regular';
}

export const Paragraph = (props: ParagraphProps) => {
  const {size, weight, style, color, family = 'lato', ...rest} = props;

  const additionalStyles: StyleProp<TextStyle> = {
    fontSize: size,
    fontWeight: weight,
    color: appColors[color || 'gray'],
    fontFamily: resolveFontFamily(family, weight),
  };

  return <Animated.Text style={[additionalStyles, style]} {...rest} />;
};
