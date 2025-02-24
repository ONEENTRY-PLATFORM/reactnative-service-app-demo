import React from 'react';
import {ScrollView} from 'react-native';
import {useGetAuthProvidersQuery} from '@/api';
import CustomButton from '@/components/shared/CustomButton';
import CreateAccountButton from '@/components/shared/CreateAccountButton';
import {router} from 'expo-router';
import {useAppSelector} from '@/state/hooks';
import Email from '@/assets/icons/Email.svg';

type Props = {
};

const AuthMethodsList: React.FC<Props> = ({}) => {
  const {data, error, isLoading} = useGetAuthProvidersQuery({});
  const {sign_in_text} = useAppSelector(state => state.SystemContentReducer.content);

  if (isLoading) {
    return <></>;
  }

  if (error) throw new Error(error?.toString());

  return (
    <ScrollView contentContainerStyle={{gap: 20}} scrollEnabled={false}>
      {data?.map((method, index) => (
        <CustomButton
          Logo={<Email />}
          isInline
          key={method?.identifier + index}
          onPress={() => router.navigate('/auth/sign_in')}
          title={sign_in_text + ' with ' + method?.localizeInfos?.title}
        />
      ))}
      <CreateAccountButton />
    </ScrollView>
  );
};

export default AuthMethodsList;
