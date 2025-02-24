import React, {useEffect, useState} from 'react';
import {Screen} from '@/components/shared/Screen';
import SignUpForm from '@/components/auth/SignUpScreen/SignUpForm';
import SignUpButton from '@/components/auth/SignUpScreen/SignUpButton';
import {useAppDispatch} from '@/state/hooks';

type Props = {};

const SignUp: React.FC<Props> = ({}) => {
  const [inputs, setInputs] = useState<{[key: string]: InputValue}>({});

  return (
    <Screen isFull edges={['top', 'horizontal', 'bottom']}>
      <SignUpForm inputs={inputs} setInputs={setInputs} />
      <SignUpButton inputs={inputs} />
    </Screen>
  );
};

export default SignUp;
