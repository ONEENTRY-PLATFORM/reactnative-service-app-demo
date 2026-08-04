import {StyleSheet, View} from 'react-native';
import {BaseToast, BaseToastProps} from 'react-native-toast-message';
import {LinearGradient} from 'expo-linear-gradient';
import {appColors} from '@/lib/constants/Colors';

// Reusable base for all branded toasts. Wraps BaseToast to add a fuchsia →
// cyan gradient progress strip along the bottom edge, matching the web
// react-toastify treatment. Consumer passes the border/icon accent color.
function BrandedBase({
  accentColor,
  ...props
}: BaseToastProps & {accentColor: string}) {
  return (
    <View style={styles.wrap}>
      <BaseToast
        {...props}
        style={[styles.base, {borderLeftColor: accentColor}]}
        contentContainerStyle={styles.content}
        text1Style={styles.title}
        text2Style={styles.body}
      />
      <LinearGradient
        colors={[appColors.primary, appColors.cyanAccent]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.progress}
      />
    </View>
  );
}

export const brandedToastConfig = {
  success: (props: BaseToastProps) => (
    <BrandedBase {...props} accentColor={appColors.primary} />
  ),
  error: (props: BaseToastProps) => (
    <BrandedBase {...props} accentColor={appColors.red} />
  ),
  info: (props: BaseToastProps) => (
    <BrandedBase {...props} accentColor={appColors.cyanAccent} />
  ),
};

const styles = StyleSheet.create({
  wrap: {
    width: '90%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: appColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  base: {
    width: '100%',
    height: 'auto',
    minHeight: 60,
    backgroundColor: appColors.white,
    borderLeftWidth: 4,
    // Cancel BaseToast defaults so shadow lives on the outer wrap.
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: appColors.charcoal,
  },
  body: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: appColors.ink,
  },
  progress: {
    height: 3,
    width: '100%',
  },
});
