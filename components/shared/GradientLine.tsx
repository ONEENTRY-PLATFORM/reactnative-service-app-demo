import {StyleProp, ViewStyle} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {appColors} from '@/lib/constants/Colors';

// Fuchsia → cyan hairline used as a section separator on the web (see the
// homepage between blocks). One React component so pages don't inline the
// gradient stops individually.
type Props = {
  height?: number;
  style?: StyleProp<ViewStyle>;
};

const GradientLine = ({height = 2, style}: Props) => (
  <LinearGradient
    colors={[appColors.primary, appColors.cyanAccent]}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
    style={[{height, width: '100%'}, style]}
  />
);

export default GradientLine;
