import React, {Dispatch, useRef} from 'react';
import {TextInput, View} from 'react-native';
import CustomInput from '@/components/shared/CustomInput';
import PasswordInput from '@/components/shared/PasswordInput';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';

type Props = {
  login: InputValue;
  setLogin: Dispatch<any>;
  pass: InputValue;
  setPass: Dispatch<any>;
};

const SignInForm: React.FC<Props> = ({login, setLogin, setPass, pass}) => {
  const {sign_in_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const passRef = useRef<TextInput>(null);

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
        setValue={setLogin}
        onSubmitEditing={() => passRef?.current?.focus()}
      />
      <PasswordInput ref={passRef} value={pass} setValue={setPass} />
    </View>
  );
};

export default SignInForm;
