import {Tabs} from 'expo-router';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGetMenuQuery} from '@/api';
import {IMenusPages} from 'oneentry/dist/menus/menusInterfaces';
import {appColors} from '@/lib/constants/Colors';
import CustomHeader from '@/components/shared/CustomHeader';
import TabBarIcon from '@/components/shared/TabBarIcon';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';

// Utility routes stay real tabs with their button hidden. Since expo-router 58
// `href: null` marks a tab `hidden`, and focusing a hidden tab immediately
// redirects to the initial tab — so profile/booking/visits became unreachable.
const HIDDEN_TAB = {tabBarItemStyle: {display: 'none'}} as const;

// Bar height above the system inset: 6 top + ~45 icon/label + 4 bottom. The
// old fixed 64/86 bars only looked right because the label ran into the
// gesture bar / home indicator.
const TAB_BAR_CONTENT_HEIGHT = 56;

// Tab layout is driven by the CMS 'main' menu — the same source web uses.
// The menu items in this project don't carry icon attributes, so we don't try
// to read attributeValues.icon; instead every pageUrl maps to a Lucide icon
// (see components/shared/TabBarIcon). Menu titles come from CMS localizeInfos.
export default function TabLayout() {
  const {data: menuData, error, isLoading} = useGetMenuQuery({marker: 'main'});
  const {setLastVisitedTab} = useHistoryContext();
  // Android draws edge-to-edge, so the gesture bar sits on top of the app: a
  // fixed-height bar put its labels under it. Grow the bar by the real inset.
  const insets = useSafeAreaInsets();
  const tabBarStyle = [
    styles.tabBar,
    {
      height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
      paddingBottom: 4 + insets.bottom,
    },
  ];

  if (isLoading) return null;

  if (error) {
    console.warn('[TabLayout] getMenu failed:', error);
  }

  return (
    <Tabs
      backBehavior={'history'}
      screenOptions={{
        tabBarActiveTintColor: appColors.primary,
        tabBarInactiveTintColor: appColors.ink,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        header: props => <CustomHeader {...props} />,
        sceneStyle: {backgroundColor: appColors.white},
        tabBarStyle,
        tabBarItemStyle: {paddingVertical: 2},
      }}>
      {(menuData?.pages as IMenusPages[] | undefined)
        ?.filter((page): page is IMenusPages & {pageUrl: string} =>
          Boolean(page.pageUrl),
        )
        .map(page => (
          <Tabs.Screen
            key={page.pageUrl}
            name={page.pageUrl}
            options={{
              title:
                ((page.localizeInfos?.menuTitle as string | null) ||
                  (page.localizeInfos?.title as string | null) ||
                  page.pageUrl) as string,
              // Header (logo + BOOK ONLINE + profile) shows on every tab —
              // same as the web layout. Was previously hidden on `home` only.
              headerShown: true,
              tabBarIcon: ({focused}) => (
                <TabBarIcon pageUrl={page.pageUrl} focused={focused} />
              ),
            }}
          />
        ))}

      {/* Utility routes — reachable via router.navigate, never shown as tabs. */}
      <Tabs.Screen
        name={'catalog/[marker]'}
        options={{...HIDDEN_TAB, title: 'Catalog'}}
      />
      <Tabs.Screen
        name={'masters/[master]'}
        options={{...HIDDEN_TAB, title: 'Master'}}
      />
      <Tabs.Screen
        name={'masters/reviews'}
        options={{...HIDDEN_TAB, title: 'Reviews'}}
      />
      <Tabs.Screen
        name={'gallery/[marker]'}
        options={{...HIDDEN_TAB, title: 'Gallery item'}}
      />
      <Tabs.Screen
        name={'order_processing'}
        options={{...HIDDEN_TAB, title: 'Deposit payment'}}
        listeners={{focus: () => setLastVisitedTab('order_processing')}}
      />
      <Tabs.Screen
        name={'confirm_booking'}
        options={{...HIDDEN_TAB, title: 'Confirm booking'}}
      />
      <Tabs.Screen
        name={'booking'}
        options={{...HIDDEN_TAB, title: 'Booking'}}
      />
      <Tabs.Screen
        name={'profile'}
        options={{...HIDDEN_TAB, title: 'Profile'}}
      />
      <Tabs.Screen
        name={'visits_history'}
        options={{...HIDDEN_TAB, title: 'Visits history'}}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: appColors.white,
    borderTopColor: appColors.slate150,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
