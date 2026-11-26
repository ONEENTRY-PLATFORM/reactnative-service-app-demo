import {useState} from 'react';
import {router} from 'expo-router';
import Toast from 'react-native-toast-message';
import CustomButton from '@/components/shared/CustomButton';
import {isGoogleSignInConfigured, runGoogleAuth} from '@/lib/googleOAuth';
import {useAuth} from '@/state/contexts/AuthContext';

type Props = {
  title: string;
};

const GoogleSignInButton = ({title}: Props) => {
  const {authenticate} = useAuth();
  const [busy, setBusy] = useState(false);

  // A button that does nothing got the app rejected (App Store 2.1(a)).
  if (!isGoogleSignInConfigured()) return null;

  const onPress = async () => {
    setBusy(true);
    try {
      const outcome = await runGoogleAuth();
      if (!outcome.ok) {
        if (outcome.reason !== 'cancelled') {
          Toast.show({
            type: 'error',
            text1: 'Google sign-in failed',
            text2: outcome.error?.message,
          });
        }
        return;
      }
      // AuthContext.authenticate re-hydrates the user via getMe now that the
      // refresh token is in MMKV. It also clears any 'isLoading' state.
      await authenticate();
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CustomButton
      isInline
      disabled={busy}
      isLoading={busy}
      onPress={onPress}
      title={title}
    />
  );
};

export default GoogleSignInButton;
