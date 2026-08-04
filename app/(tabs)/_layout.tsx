import {Tabs} from 'expo-router';
import {Platform, StyleSheet} from 'react-native';
import {useGetMenuQuery} from '@/api';
import {IMenusPages} from 'oneentry/dist/menus/menusInterfaces';
import {appColors} from '@/lib/constants/Colors';
import CustomHeader from '@/components/shared/CustomHeader';
import TabBarIcon from '@/components/shared/TabBarIcon';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';

// Tab layout is driven by the CMS 'main' menu — the same source web uses.
// The menu items in this project don't carry icon attributes, so we don't try
// to read attributeValues.icon; instead every pageUrl maps to a Lucide icon
// (see components/shared/TabBarIcon). Menu titles come from CMS localizeInfos.
export default function TabLayout() {
  const {data: menuData, error, isLoading} = useGetMenuQuery({marker: 'main'});
  const {setLastVisitedTab} = useHistoryContext();

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
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: {paddingVertical: 4},
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
        options={{href: null, title: 'Catalog'}}
      />
      <Tabs.Screen
        name={'masters/[master]'}
        options={{href: null, title: 'Master'}}
      />
      <Tabs.Screen
        name={'masters/reviews'}
        options={{href: null, title: 'Reviews'}}
      />
      <Tabs.Screen
        name={'gallery/[marker]'}
        options={{href: null, title: 'Gallery item'}}
      />
      <Tabs.Screen
        name={'order_processing'}
        options={{href: null, title: 'Deposit payment'}}
        listeners={{focus: () => setLastVisitedTab('order_processing')}}
      />
      <Tabs.Screen
        name={'confirm_booking'}
        options={{href: null, title: 'Confirm booking'}}
      />
      <Tabs.Screen
        name={'stripe_payment'}
        options={{href: null, title: 'Confirm booking'}}
      />
      <Tabs.Screen
        name={'booking'}
        options={{href: null, title: 'Booking'}}
      />
      <Tabs.Screen
        name={'profile'}
        options={{href: null, title: 'Profile'}}
      />
      <Tabs.Screen
        name={'visits_history'}
        options={{href: null, title: 'Visits history'}}
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
    paddingBottom: Platform.OS === 'ios' ? 6 : 4,
    height: Platform.OS === 'ios' ? 86 : 64,
  },
  tabLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
