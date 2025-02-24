import {Tabs, useLocalSearchParams} from 'expo-router';
import {useGetChildPagesByUrlQuery, useGetMenuQuery} from '@/api';
import {IMenusPages} from 'oneentry/dist/menus/menusInterfaces';
import CustomImage from '@/components/shared/CustomImage';
import {appColors} from '@/constants/Colors';
import CustomHeader from '@/components/shared/CustomHeader';
import {useHistoryContext} from '@/state/contexts/HistoryProvider';

export default function TabLayout() {
  const {
    data: menuData,
    error,
    isLoading,
  } = useGetMenuQuery({marker: 'phone_tab'});
  const {setLastVisitedTab} = useHistoryContext();

  if (isLoading) return null;

  if (error) throw error;

  return (
    <Tabs
      backBehavior={'history'}
      screenOptions={{
        tabBarActiveTintColor: appColors.primary,
        tabBarShowLabel: false,
        header: props => <CustomHeader {...props} />,
        sceneStyle: {
          backgroundColor: appColors.white,
        },
        tabBarStyle: {
          paddingTop: 5,
        },
      }}>
      {(menuData?.pages as IMenusPages[])?.map(page => (
        <Tabs.Screen
          key={page.pageUrl}
          name={page.pageUrl}
          options={{
            title: page.localizeInfos.title,
            headerShown: page.pageUrl !== 'home_mobile',
            tabBarIcon: ({color, focused}) => (
              <CustomImage
                color={focused ? appColors.primary : undefined}
                height={24}
                width={24}
                // @ts-ignore
                uri={page?.attributeValues?.icon?.value?.downloadLink}
              />
            ),
          }}
        />
      ))}
      <Tabs.Screen
        name="catalog/[marker]"
        options={{
          tabBarIcon: undefined,
          title: 'Catalog',
          href: null,
        }}
      />
      <Tabs.Screen
        name="masters/index"
        options={{
          tabBarIcon: undefined,
          title: 'Masters',
          href: null,
        }}
      />
      <Tabs.Screen
        name="masters/[master]"
        options={{
          tabBarIcon: undefined,
          title: 'Master',
          href: null,
        }}
      />
      <Tabs.Screen
        name="masters/reviews"
        options={{
          tabBarIcon: undefined,
          title: 'Reviews',
          href: null,
        }}
      />
      <Tabs.Screen
        name="gallery/[marker]"
        options={{
          tabBarIcon: undefined,
          title: 'Gallery item',
          href: null,
        }}
      />
      <Tabs.Screen
        name="order_processing"
        options={{
          tabBarIcon: undefined,
          title: 'Deposit payment',
          href: null,
        }}
        listeners={{
          focus: () => setLastVisitedTab('order_processing'),
        }}
      />
      <Tabs.Screen
        name="confirm_booking"
        options={{
          tabBarIcon: undefined,
          title: 'Confirm booking',
          href: null,
        }}
      />
      <Tabs.Screen
        name="stripe_payment"
        options={{
          tabBarIcon: undefined,
          title: 'Confirm booking',
          href: null,
        }}
      />
    </Tabs>
  );
}
