import {View, ViewProps, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {layoutHeight, layoutPadding} from '@/lib/constants/sizes';
import {appColors} from '@/lib/constants/Colors';

export type Edge = 'top' | 'bottom' | 'horizontal' | 'header';

type ScreenProps = ViewProps & {
  edges?: Edge[];
  white?: boolean;
  isFlex?: boolean;
  isFull?: boolean;
};

export const Screen = (props: ScreenProps) => {
  const {children, edges, isFull, style, white, isFlex, ...rest} = props;
  const {bottom, top} = useSafeAreaInsets();

  const styles: ViewStyle = {
    paddingBottom: edges?.includes('bottom') ? bottom : undefined,
    paddingTop: edges?.includes('top') ? 20 : 0,
    paddingLeft: edges?.includes('horizontal') ? layoutPadding : undefined,
    paddingRight: edges?.includes('horizontal') ? layoutPadding : undefined,
    flex: isFlex ? 1 : undefined,
    height: isFull ? layoutHeight - 60 - top : undefined,
    backgroundColor: white ? appColors.white : undefined,
  };

  return (
    <View style={[styles, style]} {...rest}>
      {children}
    </View>
  );
};
