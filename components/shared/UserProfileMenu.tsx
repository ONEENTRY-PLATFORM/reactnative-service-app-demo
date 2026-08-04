import {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {router} from 'expo-router';
import {User} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import FloatingModal from '@/components/shared/FloatingModal';
import {appColors} from '@/lib/constants/Colors';
import {useAuth} from '@/state/contexts/AuthContext';

// Header-attached user menu that mirrors the UserProfileMenu dropdown in
// nextjs-beauty. Renders nothing when the user is not signed in — callers
// don't have to gate it themselves.
const AVATAR_SIZE = 34;

function getUserInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
}

const MenuItem = ({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.item}>
    <Paragraph
      color={destructive ? 'red' : 'charcoal'}
      size={15}
      weight={destructive ? '700' : '400'}>
      {label}
    </Paragraph>
  </TouchableOpacity>
);

const UserProfileMenu = () => {
  const [visible, setVisible] = useState(false);
  const {user, logOut} = useAuth();

  // Guest: show a neutral User icon that opens the sign-in flow. Matches web
  // where the profile icon is always in the header.
  if (!user) {
    return (
      <TouchableOpacity
        onPress={() => router.navigate('/auth/sign_in')}
        activeOpacity={0.7}
        style={styles.guestBtn}>
        <User size={20} color={appColors.charcoal} />
      </TouchableOpacity>
    );
  }

  const displayName =
    (user.formData?.find((f: any) => f.marker === 'name_reg')?.value as
      | string
      | undefined) ??
    (user as any).email ??
    'You';
  const initials = getUserInitials(displayName);

  const goTo = (path: string) => {
    setVisible(false);
    router.navigate(path as any);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={styles.avatar}>
        <Paragraph color={'white'} size={13} weight={'700'}>
          {initials}
        </Paragraph>
      </TouchableOpacity>

      <FloatingModal
        visible={visible}
        setVisible={setVisible}
        pressableProps={{
          style: {alignItems: 'flex-end', justifyContent: 'flex-start'},
        }}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerAvatar}>
              <Paragraph color={'white'} size={16} weight={'700'}>
                {initials}
              </Paragraph>
            </View>
            <View style={{flex: 1}}>
              <Paragraph color={'charcoal'} size={15} weight={'700'} numberOfLines={1}>
                {displayName}
              </Paragraph>
            </View>
          </View>
          <View style={styles.separator} />
          <MenuItem label={'Profile'} onPress={() => goTo('/(tabs)/profile')} />
          <MenuItem
            label={'Visits history'}
            onPress={() => goTo('/(tabs)/visits_history')}
          />
          <View style={styles.separator} />
          <MenuItem
            label={'Sign out'}
            destructive
            onPress={() => {
              setVisible(false);
              logOut();
            }}
          />
        </View>
      </FloatingModal>
    </>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: appColors.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtn: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: appColors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.white,
  },
  sheet: {
    marginTop: 70,
    marginRight: 12,
    width: 240,
    backgroundColor: appColors.white,
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: appColors.slate150,
    marginVertical: 4,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});

export default UserProfileMenu;
