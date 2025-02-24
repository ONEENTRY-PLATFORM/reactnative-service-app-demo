import React, {useState} from 'react';
import {Screen} from '@/components/shared/Screen';
import SignInButton from '@/components/auth/SignInScreen/SignInButton';
import SignInForm from '@/components/auth/SignInScreen/SignInForm';
import {View} from 'react-native';
import CreateAccountButton from '@/components/shared/CreateAccountButton';
import ResetPassButton from '@/components/auth/SignInScreen/ResetPassButton';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const SignIn: React.FC<Props> = ({}) => {
  const [login, setLogin] = useState<InputValue>({value: '', valid: true});
  const [pass, setPass] = useState<InputValue>({value: '', valid: true});

  return (
    <Screen
      isFull
      className={'justify-between'}
      edges={['top', 'horizontal', 'bottom']}>

      <SignInForm
        login={login}
        setLogin={setLogin}
        pass={pass}
        setPass={setPass}
      />
      <View className={'gap-y-[50px]'}>
        <View className={'gap-y-4'}>
          <SignInButton login={login.value} password={pass.value} />
          <ResetPassButton />
        </View>
        <CreateAccountButton />
      </View>
    </Screen>
  );
};

export default SignIn;
