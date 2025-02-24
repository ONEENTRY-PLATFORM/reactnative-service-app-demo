import React, {Dispatch} from 'react';
import {Modal, Pressable, PressableProps, View} from 'react-native';

type Props = {
  visible: boolean;
  setVisible: Dispatch<boolean>;
  pressableProps: PressableProps;
  children: React.ReactNode;
};

const FloatingModal = ({
  visible,
  setVisible,
  pressableProps,
  children,
}: Props) => {
  const {style, ...otherProps} = pressableProps;
  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      animationType="fade"
      transparent>
      <Pressable
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          style as any,
        ]}
        onPress={() => setVisible(false)}
        {...otherProps}>
        <View onStartShouldSetResponder={() => true}>{children}</View>
      </Pressable>
    </Modal>
  );
};

export default FloatingModal;
