import React, { Dispatch, useRef } from 'react';
import {View} from 'react-native';
import type {TextInputInstance} from 'react-native';
import CustomInput from '@/components/shared/CustomInput';
import PasswordInput from '@/components/shared/PasswordInput';
import { Paragraph } from '@/components/shared/Paragraph';
import { useAppSelector } from '@/state/hooks';

type Props = {
  login: string;
  setLogin: Dispatch<string>;
  pass: string;
  setPass: Dispatch<string>;
};

const SignInForm: React.FC<Props> = ({ login, setLogin, setPass, pass }) => {
  const { sign_in_text } = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const passRef = useRef<TextInputInstance>(null);

  return (
    <View className={'gap-y-5'}>
      <View className={'my-10'}>
        <Paragraph size={40} color={'dark'} weight={'600'}>
          {sign_in_text}
        </Paragraph>
      </View>
      <CustomInput
        title={'E-mail'}
        keyboardType={'email-address'}
        autoCapitalize={'none'}
        value={login}
        onChangeText={setLogin}
        onSubmitEditing={() => passRef?.current?.focus()}
      />
      <CustomInput
        ref={passRef}
        value={pass}
        onChangeText={setPass}
        title={'Password'}
        secureTextEntry
      />
    </View>
  );
};

export default SignInForm;
