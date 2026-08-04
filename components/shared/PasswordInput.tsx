import React, {Dispatch, forwardRef, useRef, useState} from 'react';
import Eye from '@/assets/icons/PasswordVisible.svg';
import ClosedEye from '@/assets/icons/PasswordInvisible.svg';
import CustomInput from '@/components/shared/CustomInput';
import {useAppSelector} from '@/state/hooks';
import {TextInput} from 'react-native';

type Props = {
  validators?: Record<string, any>;
  value: InputValue;
  setValue: (value: InputValue) => void;
  repeatPassword?: string;
  setRepeatPassword?: Dispatch<string>;
};

const PasswordInput = forwardRef<TextInput, Props>(
  ({validators, value, setValue, repeatPassword, setRepeatPassword}, ref) => {
    const [visible, setVisible] = useState<boolean>(false);
    const passwordInputRef = useRef<TextInput>(null);

    const {password_input_title_text, reset_password_text} = useAppSelector(
      state => state.SystemContentReducer.content,
    );

    const onReveal = () => {
      setVisible(!visible);
    };

    return (
      <>
        <CustomInput
          ref={ref}
          Icon={visible ? Eye : ClosedEye}
          onPressIcon={onReveal}
          validators={
            setRepeatPassword
              ? {
                  ...validators,
                  correctPasswordValidator: repeatPassword,
                }
              : validators
          }
          value={value}
          setValue={setValue}
          keyboardType={visible ? 'visible-password' : 'default'}
          secureTextEntry={!visible}
          onSubmitEditing={() =>
            passwordInputRef?.current?.focus && passwordInputRef.current.focus()
          }
          key={'pass'}
          title={password_input_title_text}
        />
        {setRepeatPassword && (
          <CustomInput
            ref={passwordInputRef}
            Icon={visible ? Eye : ClosedEye}
            onPressIcon={onReveal}
            value={{
              value: repeatPassword || '',
              valid: repeatPassword === value.value,
            }}
            setValue={val => {
              setRepeatPassword(val.value);
              setValue({...value, valid: val.valid});
            }}
            validators={{correctPasswordValidator: value.value}}
            secureTextEntry={!visible}
            title={'Repeat ' + password_input_title_text}
            key={'repeat-pass'}
          />
        )}
      </>
    );
  },
);

export default PasswordInput;
