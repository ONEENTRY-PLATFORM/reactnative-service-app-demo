import React from 'react';
import {Screen} from '@/components/shared/Screen';
import {Paragraph} from '@/components/shared/Paragraph';
import CustomButton from '@/components/shared/CustomButton';
import {useAppSelector} from '@/state/hooks';
import {router} from 'expo-router';

type Props = {};

const UnauthorizedError: React.FC<Props> = ({}) => {
  const {authorize_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  return (
    <Screen
      isFull
      className={'gap-5 justify-center'}
      white
      edges={['top', 'horizontal']}>
      <Paragraph size={56} weight={'bold'}>
        Unauthorized
      </Paragraph>
      <Paragraph size={28}>Unauthorized error</Paragraph>
      <CustomButton
        style={{marginTop: 20}}
        paragraphProps={{
          style: {color: '#fff'},
          weight: 'bold',
          size: 16,
        }}
        onPress={() => router.navigate('/auth')}>
        {authorize_text}
      </CustomButton>
    </Screen>
  );
};

export default UnauthorizedError;
