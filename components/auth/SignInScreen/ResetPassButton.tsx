import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';

type Props = {};

const ResetPassButton: React.FC<Props> = ({}) => {
  const {reset_password_text, forgot_password_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const onRequestResetPassword = async () => {
    router.navigate('/auth/reset');
  };

  return (
    <View className={'flex-row mt-2.5 items-center justify-between'}>
      <Paragraph size={20}>{forgot_password_text}</Paragraph>
      <TouchableOpacity onPress={onRequestResetPassword}>
        <View>
          <Paragraph color={'blue'} size={20}>
            {reset_password_text}
          </Paragraph>
          <View className={'h-[1px] bg-blue w-full'} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPassButton;
