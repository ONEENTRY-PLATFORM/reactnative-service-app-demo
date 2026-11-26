import {useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {router} from 'expo-router';
import Toast from 'react-native-toast-message';
import AppleSignInButton from '@/components/auth/WelcomeScreen/AppleSignInButton';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';
import {isGoogleSignInConfigured, runGoogleAuth} from '@/lib/googleOAuth';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';

// "or continue with" block shared by the sign-in and sign-up screens: OAuth
// sign-in creates the account on first use, so it is a registration method as
// well. Sign in with Apple is offered on iOS next to Google (App Store 4.8).
// Google renders only when its OAuth client is configured — a button that
// does nothing got the app rejected under 2.1(a).
const SocialSignIn = () => {
  const dict =
    useAppSelector(state => state.SystemContentReducer.content) ?? {};
  const showApple = Platform.OS === 'ios';
  const showGoogle = isGoogleSignInConfigured();

  if (!showApple && !showGoogle) return null;

  return (
    <View style={{gap: 12}}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Paragraph size={12} color={'gray'} style={{marginHorizontal: 12}}>
          {(dict.or_continue_with_text as string) || 'or continue with'}
        </Paragraph>
        <View style={styles.dividerLine} />
      </View>
      {showGoogle ? (
        <GoogleButton
          title={
            (dict.sign_in_with_google_text as string) || 'Sign in with Google'
          }
        />
      ) : null}
      {showApple ? <AppleSignInButton /> : null}
    </View>
  );
};

const GoogleButton = ({title}: {title: string}) => {
  const {authenticate} = useAuth();
  const [busy, setBusy] = useState(false);

  const onPress = async () => {
    if (busy) return;
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
      await authenticate();
      router.replace('/(tabs)/profile');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={busy}
      accessibilityRole={'button'}
      style={styles.google}>
      {busy ? (
        <ActivityIndicator size={'small'} color={appColors.primary} />
      ) : (
        <View style={styles.googleIcon}>
          <Paragraph size={16} weight={'700'} style={{color: '#4285F4'}}>
            G
          </Paragraph>
        </View>
      )}
      <Paragraph size={14} weight={'700'} color={'charcoal'}>
        {title}
      </Paragraph>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: appColors.slate150,
  },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SocialSignIn;
