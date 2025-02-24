import React, {useState} from 'react';
import {Screen} from '@/components/shared/Screen';
import {OTPInput, OTPKeyboard} from '@/components/auth/OTPScreen';

type Props = {};

const OtpScreen: React.FC<Props> = ({}) => {
  const [value, setValue] = useState<string>('');

  return (
    <Screen
      isFull
      className={'justify-between'}
      edges={['top', 'horizontal', 'bottom']}>
      <OTPInput value={value} setValue={setValue} />
      <OTPKeyboard value={value} setValue={setValue} />
    </Screen>
  );
};

export default OtpScreen;
