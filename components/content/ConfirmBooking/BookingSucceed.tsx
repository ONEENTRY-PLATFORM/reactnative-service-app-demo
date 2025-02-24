import React from 'react';
import CardBase from '@/components/shared/CardBase';
import {appColors} from '@/constants/Colors';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {};

const BookingSucceed: React.FC<Props> = ({}) => {
  return (
    <CardBase onPress={() => {}}>
      <Paragraph className={'text-center'} weight={'300'} size={32} color={'blue'}>
        Your appointment has been confirmed.{'\n'} See you soon!
      </Paragraph>
    </CardBase>
  );
};

export default BookingSucceed;
