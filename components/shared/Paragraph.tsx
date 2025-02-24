import {StyleProp, TextProps, TextStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import {appColors} from '@/constants/Colors';

export type ParagraphProps = TextProps & {
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: keyof typeof appColors;
};
export const Paragraph = (props: ParagraphProps) => {
  const {size, weight, style, color, ...rest} = props;

  const additionalStyles: StyleProp<TextStyle> = {
    fontSize: size,
    fontWeight: weight,
    color: appColors[color || 'gray'],
  };

  return <Animated.Text style={[additionalStyles, style]} {...rest} />;
};
