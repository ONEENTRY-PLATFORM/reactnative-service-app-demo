import React, {forwardRef, FunctionComponent, useState} from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import {Paragraph, ParagraphProps} from '@/components/shared/Paragraph';
import {appColors} from '@/constants/Colors';
import {validationMethods} from '@/lib/validationMethods';
import AlertSVG from '@/assets/icons/Alert.svg';

type Props = {
  title?: string;
  onPressIcon?: () => void;
  Icon?: FunctionComponent;
  validators?: Record<string, any>;
  value: InputValue;
  setValue: (value: InputValue) => void;
  errorParagraphProps?: ParagraphProps;
  errorMessage?: string;
} & Omit<TextInputProps, 'value'>;

const CustomInput = forwardRef<TextInput, Props>(
  (
    {
      title,
      Icon,
      validators,
      value,
      setValue,
      onPressIcon,
      errorParagraphProps,
      errorMessage,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const {style, ...other} = rest;

    const onChange = (val: string) => {
      let valid = true;
      if (validators) {
        valid = Object.keys(validators)?.reduce(
          (isValid, validator: string): boolean => {
            if (!val) {
              return false;
            }
            // @ts-ignore
            const validatorFunc = validationMethods[validator];
            const result = validatorFunc
              ? validatorFunc(val, validators[validator])
              : true;

            console.log(result);

            if (isValid) {
              return result;
            } else {
              return false;
            }
          },
          true,
        );
      }

      setValue({value: val, valid});
    };

    return (
      <View className={'gap-y-1.5'}>
        {title && (
          <Paragraph size={20} weight={'400'} color={'gray'}>
            {title}
          </Paragraph>
        )}
        <View className={'flex-row justify-between items-center'}>
          <TextInput
            style={[
              style,
              styles.input,
              !value.valid ? styles.invalidValue : styles.validStyles,
              isFocused && styles.focusedStyles,
            ]}
            value={value.value}
            placeholderTextColor={appColors.gray}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={ref}
            {...other}
          />

          {Icon && (
            <TouchableOpacity
              onPress={onPressIcon}
              className={'absolute right-0 h-full justify-center'}>
              <Icon />
            </TouchableOpacity>
          )}
        </View>

        {!value.valid && (
          <View style={styles.errorContainer}>
            <AlertSVG />
            <Paragraph size={12} color={'red'} {...errorParagraphProps}>
              {errorMessage}
            </Paragraph>
          </View>
        )}
      </View>
    );
  },
);

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

export default CustomInput;
