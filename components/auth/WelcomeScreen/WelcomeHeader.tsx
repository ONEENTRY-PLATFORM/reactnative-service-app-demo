import React, {memo} from 'react';
import {View} from 'react-native';
import CustomImage from '@/components/shared/CustomImage';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {};

const WelcomeHeader: React.FC<Props> = ({}) => {
  const {round_logo, welcome_message_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  return (
    <View className={'items-center w-full mb-10 gap-y-5'}>
      <CustomImage uri={round_logo} width={190} height={190} />
      <Paragraph
        style={{lineHeight: 30}}
        color={'gray'}
        size={20}
        weight={'500'}>
        {welcome_message_text}
      </Paragraph>
    </View>
  );
};

export default memo(WelcomeHeader);
