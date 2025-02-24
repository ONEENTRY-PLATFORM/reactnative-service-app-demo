import React from 'react';
import {Linking, TouchableOpacity} from 'react-native';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';

type Props = {};

const PolicyLink: React.FC<Props> = ({}) => {
  const {privacy_policy_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const url = process.env.EXPO_PUBLIC_POLICY_URL;
  return (
    <TouchableOpacity
      className={'w-full items-center self-start'}
      onPress={() => Linking.openURL(url || 'google.com')}>
      <Paragraph
        className={'underline underline-offset-1'}
        size={18}
        weight={'600'}
        color={'primary'}>
        {privacy_policy_text}
      </Paragraph>
    </TouchableOpacity>
  );
};

export default PolicyLink;
