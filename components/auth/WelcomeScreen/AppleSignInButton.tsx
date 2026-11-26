import {useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {router} from 'expo-router';
import Toast from 'react-native-toast-message';
import {runAppleAuth} from '@/lib/appleOAuth';
import {useAuth} from '@/state/contexts/AuthContext';

const AppleSignInButton = () => {
  const {authenticate} = useAuth();
  const [busy, setBusy] = useState(false);

  if (Platform.OS !== 'ios') {
    return null;
  }

  const onPress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const outcome = await runAppleAuth();
      if (!outcome.ok) {
        if (outcome.reason !== 'cancelled') {
          const errorDetail = outcome.error
            ? `[${outcome.error.statusCode}] ${outcome.error.message ?? ''}`
            : outcome.reason;
          Toast.show({
            type: 'error',
            text1: 'Apple sign-in failed',
            text2: errorDetail,
          });
        }
        return;
      }
      await authenticate();
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
      cornerRadius={999}
      style={styles.button}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    width: '100%',
  },
});

export default AppleSignInButton;
