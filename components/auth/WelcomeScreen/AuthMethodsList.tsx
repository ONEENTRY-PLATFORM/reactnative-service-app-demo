import React from 'react';
import {ScrollView} from 'react-native';
import {useGetAuthProvidersQuery} from '@/api';
import CustomButton from '@/components/shared/CustomButton';
import CreateAccountButton from '@/components/shared/CreateAccountButton';
import EmptyState from '@/components/shared/EmptyState';
import GoogleSignInButton from '@/components/auth/WelcomeScreen/GoogleSignInButton';
import {router} from 'expo-router';
import {useAppSelector} from '@/state/hooks';
import Email from '@/assets/icons/Email.svg';

type Props = {
};

// OAuth providers are rendered with a dedicated button that runs the OAuth
// dance in-app instead of the email/password form. `identifier` in OneEntry
// carries the marker ('email', 'google', …) and `type` is 'oauth' for
// third-party providers — either signal works, we key off identifier here.
const isOAuth = (identifier?: string) => identifier === 'google';

const AuthMethodsList: React.FC<Props> = ({}) => {
  const {data, error, isLoading} = useGetAuthProvidersQuery({});
  const {sign_in_text} = useAppSelector(state => state.SystemContentReducer.content);

  if (isLoading) {
    return <></>;
  }

  if (error) {
    console.warn('[AuthMethodsList] getAuthProviders failed:', error);
    return (
      <EmptyState
        title={'Sign-in unavailable'}
        description={'Auth providers could not be loaded from the CMS.'}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        compact
        title={'No sign-in methods'}
        description={'No auth providers configured for this project.'}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={{gap: 20}} scrollEnabled={false}>
      {data?.map((method, index) => {
        const label = sign_in_text + ' with ' + method?.localizeInfos?.title;
        if (isOAuth(method?.identifier)) {
          return (
            <GoogleSignInButton
              key={method?.identifier + index}
              title={label}
            />
          );
        }
        return (
          <CustomButton
            Logo={<Email />}
            isInline
            key={method?.identifier + index}
            onPress={() => router.navigate('/auth/sign_in')}
            title={label}
          />
        );
      })}
      <CreateAccountButton />
    </ScrollView>
  );
};

export default AuthMethodsList;
