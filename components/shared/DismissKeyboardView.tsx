import React from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native';

type DismissKeyboardViewProps = ViewProps & {
  disabled?: boolean;
};

export default function DismissKeyboardView({
  children,
  style,
  disabled,
  ...rest
}: DismissKeyboardViewProps) {
  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      disabled={disabled}
      touchSoundDisabled>
      <View style={[{ flex: 1 }, style]} {...rest}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
