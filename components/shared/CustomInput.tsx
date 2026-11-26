import React, {ReactNode, RefObject} from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInputProps,
  type TextInputInstance,
} from 'react-native';
import {Paragraph, ParagraphProps} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import CustomImage from '@/components/shared/CustomImage';

export const InputErrorMessage = ({
  errorMessage,
  errorParagraphProps,
}: {
  errorMessage?: string;
  errorParagraphProps?: ParagraphProps;
}) => {
  return (
    <View style={styles.errorContainer}>
      <CustomImage
        height={15}
        width={15}
        contentFit={'contain'}
        uri={require('../../assets/icons/Alert.svg')}
      />
      <Paragraph size={12} color={'red'} {...errorParagraphProps}>
        {errorMessage}
      </Paragraph>
    </View>
  );
};

type Props = {
  title?: string;
  onPressIcon?: () => void;
  Icon?: ReactNode;
  errorMessage?: string;
  type?: 'normal' | 'compact';
  ref?: RefObject<TextInputInstance | null>;
  width?: number;
} & TextInputProps;

const CustomInput: React.FC<Props> = ({
  title,
  onPressIcon,
  Icon,
  ref,
  errorMessage,
  type = 'normal',
  style,
  width,
  ...other
}) => {
  const {value, onChangeText} = other;
  const isFocused = ref?.current?.isFocused();

  return (
    <View style={{width}} className={'gap-y-1.5'}>
      {title && (
        <Paragraph size={14} weight={'300'}>
          {title}
        </Paragraph>
      )}
      <View className={'flex-row justify-between items-center'}>
        <TextInput
          style={[
            styles.input,
            style,
            errorMessage ? styles.invalidValue : styles.validStyles,
            isFocused && styles.focusedStyles,
            other.multiline && styles.multilineInputStyle,
          ]}
          placeholderTextColor={appColors.gray}
          ref={ref}
          {...other}
        />

        {Icon && (
          <TouchableOpacity
            onPress={onPressIcon}
            className={'absolute right-0 h-full justify-center'}>
            {Icon}
          </TouchableOpacity>
        )}
      </View>
      {errorMessage && <InputErrorMessage errorMessage={errorMessage} />}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  invalidValue: {
    backgroundColor: '#f8d7d7',
    borderColor: appColors.red,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: appColors.gray,
    width: '100%',
    fontSize: 17,
    paddingVertical: 5,
    paddingBottom: 8,
    fontWeight: '400',
    lineHeight: 22,
  },
  multilineInputStyle: {
    marginTop: 3,
    height: 186,
    paddingTop: 10,
    paddingBottom: 10,
  },
  validStyles: {
    borderColor: appColors.green,
  },
  focusedStyles: {
    borderColor: appColors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
