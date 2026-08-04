import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router, useSegments} from 'expo-router';
import type {NativeStackHeaderProps} from 'expo-router/build/react-navigation/native-stack/types';
import type {BottomTabHeaderProps} from 'expo-router/build/react-navigation/bottom-tabs/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Paragraph} from '@/components/shared/Paragraph';
import GoBackButton from '@/components/shared/GoBackButton';
import UserProfileMenu from '@/components/shared/UserProfileMenu';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';

// Tab header — mirrors the web layout (nextjs-beauty header): Thalia logo on
// the left, big pink BOOK ONLINE pill in the centre, profile icon on the
// right. Non-tab (auth) screens keep the compact back-button + title layout.

const PINK = '#ed21f1';
const PINK2 = '#f60efb';

type Props = (NativeStackHeaderProps | BottomTabHeaderProps) & {
  isAuth?: boolean;
};

const CustomHeader: React.FC<Props> = ({isAuth = false, ...props}) => {
  const {oneentry_logo} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const {top} = useSafeAreaInsets();
  const {options} = props;
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];

  // Auth stack keeps the older compact header (back arrow + centered title
  // or logo). Sign-in / sign-up / reset / new_password set headerShown:false
  // in the auth _layout and draw their own header inside the page.
  if (isAuth) {
    return (
      <View style={{backgroundColor: 'transparent'}}>
        <View style={[styles.authHeader, {marginTop: top}]}>
          <GoBackButton style={'gray'} />
          <View style={styles.centerAbsolute} pointerEvents={'none'}>
            {oneentry_logo &&
            currentScreen !== 'otp_screen' &&
            currentScreen !== 'reset' ? (
              <Image
                source={{uri: oneentry_logo}}
                style={{width: 132, height: 34, resizeMode: 'contain'}}
              />
            ) : (
              <Paragraph size={18} weight={'700'} color={'charcoal'}>
                {String(options.title ?? '')}
              </Paragraph>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    // The white background extends behind the notch (paddingTop = safe-area
    // inset), and a soft shadow matches the web header. Tabs headers are
    // sticky by default — nothing scrolls it away.
    <View style={[styles.headerRoot, {paddingTop: top}]}>
      <View style={styles.tabHeader}>
        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)/home')}
          activeOpacity={0.85}
          style={styles.logoBox}>
          {oneentry_logo ? (
            <Image source={{uri: oneentry_logo}} style={styles.logo} />
          ) : (
            <Paragraph
              family={'league-gothic'}
              size={26}
              color={'charcoal'}
              style={{letterSpacing: 1}}>
              THALIA
            </Paragraph>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)/booking')}
          activeOpacity={0.9}
          style={styles.bookBtn}>
          <LinearGradient
            colors={[PINK2, PINK]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <Paragraph
            size={12}
            weight={'700'}
            color={'white'}
            style={{letterSpacing: 1, textTransform: 'uppercase'}}>
            Book online
          </Paragraph>
        </TouchableOpacity>

        <UserProfileMenu />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  authHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerRoot: {
    backgroundColor: appColors.white,
    // Web header uses a subtle drop shadow — replicate on iOS via shadow
    // and on Android via elevation.
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
    zIndex: 10,
  },
  tabHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
  },
  centerAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    flexShrink: 1,
  },
  logo: {
    width: 108,
    height: 30,
    resizeMode: 'contain',
  },
  bookBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: PINK,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
});

export default CustomHeader;
