import React, {useEffect, useState} from 'react';
import {Screen} from '@/components/shared/Screen';
import {Alert, View} from 'react-native';
import CustomInput from '@/components/shared/CustomInput';
import CustomButton from '@/components/shared/CustomButton';
import {router} from 'expo-router';
import {useGenerateOTPMutation} from '@/api';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const Reset: React.FC<Props> = ({}) => {
  const [value, setValue] = useState<InputValue>({valid: false, value: ''});
  const [generateOTP, {error, data}] = useGenerateOTPMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const {reset_pass_description, send_text} = useAppSelector(state => state.SystemContentReducer.content);

  useEffect(() => {
    if (error) {
      Alert.alert(error.toString());
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      router.navigate(`/auth/otp_screen?identifier=${value.value}&event=reset`);
    }
  }, [data]);

  return (
    <Screen isFull edges={['top', 'horizontal', 'bottom']}>
      <View className={'mt-28 justify-between flex-1'} style={{gap: 30}}>
        <View className={'gap-6'}>
          <Paragraph size={20}>{reset_pass_description}</Paragraph>
          <CustomInput
            autoCapitalize={'none'}
            keyboardType={'email-address'}
            title={'Enter your e-mail'}
            placeholder={'enter e-mail'}
            value={value}
            setValue={setValue}
          />
        </View>
        <CustomButton
          isLoading={loading}
          onPress={async () => {
            setLoading(true);
            await generateOTP({
              marker: 'email',
              identifier: value.value,
              event: 'generate_otp',
            });
            setLoading(false);
          }}
          title={send_text?.toString()?.toUpperCase()}
        />
      </View>
    </Screen>
  );
};

export default Reset;
