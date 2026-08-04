import {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {router} from 'expo-router';
import {appColors} from '@/lib/constants/Colors';

// Fallback landing page for the myapp://auth/callback/google deep link. In
// the happy path expo-auth-session catches the redirect internally and
// returns a result from promptAsync() before this screen ever mounts. This
// route exists so that:
//   1. The deep-link scheme has a matching entry in the router (typedRoutes
//      would complain otherwise).
//   2. If the browser hands the callback back to the OS a beat late, the
//      user sees a spinner instead of a blank screen.
export default function GoogleOAuthCallback() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/'), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appColors.white,
      }}>
      <ActivityIndicator size={'large'} color={appColors.primary} />
    </View>
  );
}
