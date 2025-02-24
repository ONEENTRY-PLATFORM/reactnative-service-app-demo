import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {appColors} from '@/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';
import {useAppSelector} from '@/state/hooks';

type Props = {};

const BookingFailed: React.FC<Props> = ({}) => {
  const {try_again_text, smth_wrong_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  return (
    <CardBase
      outline
      outlineColor={appColors.primary}
      onPress={() => {}}
      touchableOpacityProps={{className: 'rounded-lg'}}>
      <Paragraph
        className={'text-center'}
        weight={'300'}
        size={32}
        color={'dark'}>
        {smth_wrong_text}
      </Paragraph>
      <Paragraph
        className={'text-center'}
        weight={'300'}
        size={32}
        color={'blue'}>
        {try_again_text}
      </Paragraph>
    </CardBase>
  );
};

export default BookingFailed;
