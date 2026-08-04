import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {Eye, EyeOff, X} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '@/state/contexts/AuthContext';
import {useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

// Mobile sign-in mirrors the web SignInForm design: fuchsia-gradient header
// with a close X, underline inputs (label above), primary pink CTA, "or
// continue with" divider, Google sign-in row, Forgot / Reset Password link
// and a bottom "CREATE AN ACCOUNT" outlined pill.

const PINK = '#ed21f1';
const PINK2 = '#f60efb';

const SignIn: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {signIn, isLoading} = useAuth();
  const dict = useAppSelector(state => state.SystemContentReducer.content) ?? {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string>('');
  const [userMissing, setUserMissing] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSignIn = async () => {
    if (!canSubmit) return;
    setError('');
    setUserMissing(false);
    const res = await signIn({
      method: 'email',
      login: email.trim(),
      password,
    });
    if (!res.ok) {
      setError(res.error);
      setUserMissing(res.userMissing);
      return;
    }
    // On success replace the auth stack with the profile screen so the user
    // can't come back to this form via the OS back gesture.
    router.replace('/(tabs)/profile');
  };

  const goToSignUp = () => {
    // Prefill nothing yet — the sign-up screen resets on mount. Send the
    // typed e-mail via `identifier` so it can be picked up later if we ever
    // wire the sign-up form to pre-populate.
    router.navigate('/auth/sign_up');
  };

  return (
    <View style={{flex: 1, backgroundColor: appColors.white}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps={'handled'}
          showsVerticalScrollIndicator={false}>
          {/* Fuchsia gradient header — full width, extends behind the notch */}
          <LinearGradient
            colors={[PINK2, PINK]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.header, {paddingTop: insets.top + 18}]}>
            <Paragraph size={26} weight={'700'} color={'white'}>
              {(dict.sign_in_text as string) || 'Sign In'}
            </Paragraph>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              style={styles.closeBtn}>
              <X size={16} color={appColors.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Body — full width, no card border */}
          <View style={styles.body}>
            <UnderlineField
              label={(dict.email_label as string) || 'E-mail *'}
              value={email}
              onChangeText={setEmail}
              placeholder={'john@one.com'}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              autoComplete={'email'}
            />
            <UnderlineField
              label={(dict.password_label as string) || 'Password *'}
              value={password}
              onChangeText={setPassword}
              placeholder={'Password'}
              secureTextEntry={!showPass}
              autoCapitalize={'none'}
              autoComplete={'password'}
              trailing={
                <TouchableOpacity
                  onPress={() => setShowPass(v => !v)}
                  activeOpacity={0.7}
                  hitSlop={8}>
                  {showPass ? (
                    <EyeOff size={18} color={appColors.gray} />
                  ) : (
                    <Eye size={18} color={appColors.gray} />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Primary CTA */}
            <TouchableOpacity
              onPress={onSignIn}
              disabled={!canSubmit || isLoading}
              activeOpacity={0.9}
              style={[
                styles.primary,
                (!canSubmit || isLoading) && styles.primaryDisabled,
              ]}>
              {canSubmit && !isLoading ? (
                <LinearGradient
                  colors={[PINK2, PINK]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              {isLoading ? (
                <ActivityIndicator size={'small'} color={appColors.white} />
              ) : (
                <Paragraph
                  size={14}
                  weight={'700'}
                  style={{
                    color: canSubmit ? appColors.white : appColors.gray,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                  {(dict.sign_in_text as string) || 'Sign in'}
                </Paragraph>
              )}
            </TouchableOpacity>

            {/* Inline error banner — shown after any failed sign-in attempt.
                When the account doesn't exist we also surface a big "Register
                instead" CTA below so the user can jump straight to sign-up. */}
            {error ? (
              <View style={styles.errorBox}>
                <Paragraph size={13} weight={'700'} style={{color: PINK}}>
                  {error}
                </Paragraph>
                {userMissing ? (
                  <TouchableOpacity
                    onPress={goToSignUp}
                    activeOpacity={0.85}
                    style={styles.registerCta}>
                    <LinearGradient
                      colors={[PINK2, PINK]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={StyleSheet.absoluteFill}
                    />
                    <Paragraph
                      size={13}
                      weight={'700'}
                      color={'white'}
                      style={{letterSpacing: 1, textTransform: 'uppercase'}}>
                      Register instead
                    </Paragraph>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Paragraph size={12} color={'gray'} style={{marginHorizontal: 12}}>
                {(dict.or_continue_with_text as string) || 'or continue with'}
              </Paragraph>
              <View style={styles.dividerLine} />
            </View>

            {/* Google sign-in — visual only for now (matches web layout).
                Wire up when the mobile Google auth handler is available. */}
            <TouchableOpacity activeOpacity={0.85} style={styles.google}>
              <View style={styles.googleIcon}>
                <Paragraph size={16} weight={'700'} style={{color: '#4285F4'}}>
                  G
                </Paragraph>
              </View>
              <Paragraph size={14} weight={'700'} color={'charcoal'}>
                {(dict.sign_in_with_google_text as string) ||
                  'Sign in with Google'}
              </Paragraph>
            </TouchableOpacity>

            {/* Forgot password row */}
            <View style={styles.forgotRow}>
              <Paragraph size={13} color={'gray'}>
                {(dict.forgot_password_text as string) ||
                  'Forgot your password?'}
              </Paragraph>
              <Pressable
                onPress={() => router.navigate('/auth/reset')}
                hitSlop={8}>
                <Paragraph
                  size={13}
                  weight={'700'}
                  style={{color: PINK, marginLeft: 6}}>
                  {(dict.reset_password_text as string) || 'Reset Password'}
                </Paragraph>
              </Pressable>
            </View>

            {/* Create account — outlined pill */}
            <TouchableOpacity
              onPress={() => router.navigate('/auth/sign_up')}
              activeOpacity={0.85}
              style={styles.createAccount}>
              <Paragraph
                size={13}
                weight={'700'}
                style={{
                  color: PINK,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                {(dict.create_account_text as string) || 'Create an account'}
              </Paragraph>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const UnderlineField: React.FC<
  React.ComponentProps<typeof TextInput> & {
    label: string;
    trailing?: React.ReactNode;
  }
> = ({label, trailing, ...rest}) => (
  <View style={{gap: 4}}>
    <Paragraph size={12} color={'gray'}>
      {label}
    </Paragraph>
    <View style={styles.fieldRow}>
      <TextInput
        {...rest}
        placeholderTextColor={appColors.gray}
        style={styles.input}
      />
      {trailing ? <View style={{marginLeft: 8}}>{trailing}</View> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: appColors.white,
    gap: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: appColors.slate200,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: appColors.charcoal,
    fontFamily: 'Lato_400Regular',
    paddingVertical: 8,
  },
  primary: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  primaryDisabled: {
    backgroundColor: '#f7f7fb',
    shadowOpacity: 0,
    elevation: 0,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(237,33,241,0.35)',
    backgroundColor: 'rgba(237,33,241,0.06)',
    gap: 10,
  },
  registerCta: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
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
    paddingVertical: 12,
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
  forgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  createAccount: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: appColors.white,
  },
});

export default SignIn;
