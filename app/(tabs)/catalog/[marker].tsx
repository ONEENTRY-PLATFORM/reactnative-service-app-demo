import React, {useEffect, useMemo} from 'react';
import {Screen} from '@/components/shared/Screen';
import {useFocusEffect, useLocalSearchParams, useNavigation} from 'expo-router';
import {
  useLazyGetProductsByIdsQuery,
  useLazyGetProductsByPageUrlQuery,
} from '@/api';
import {IProductEntity} from 'oneentry/dist/products/productsInterfaces';
import {ScrollView} from 'react-native';
import ServiceSelectList from '@/components/content/CatalogScreen/ServiceSelectList';
import ServiceSelectButton from '@/components/content/CatalogScreen/ServiceSelectButton';
import {useAppSelector} from '@/state/hooks';
import {getMasterById} from '@/state/reducers/MastersSlice';

type Props = {};

const CatalogScreen: React.FC<Props> = ({}) => {
  const {marker, id, title} = useLocalSearchParams();
  const [getData, {data: catalogData}] = useLazyGetProductsByPageUrlQuery({});
  const [getMasterProducts, {data: masterData}] =
    useLazyGetProductsByIdsQuery();
  const master = useAppSelector(state =>
    getMasterById(state, parseInt(id as string)),
  );

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title, // Set the header title
    });
  }, [navigation, title]);

  useEffect(() => {
    try {
      if (master) {
        const ids = master?.attributeValues?.services?.value
          ?.map((service: any) => {
            if (typeof service.id === 'string') {
              const serviceId = service?.id?.split('-')[2];
              return parseInt(serviceId);
            }
          })
          ?.filter((id: number) => id !== undefined);
        getMasterProducts({ids});
      } else {
        getData({pageUrl: marker as string});
      }
    } catch (e) {
      console.log(e);
    }
  }, [master, marker]);

  const servicesByCategories = useMemo(() => {
    const data = catalogData || masterData;
    const categories: {
      [key: string]: {
        title: string;
        data: IProductEntity[];
      };
    } = {
      main: {
        title: 'main',
        data: [],
      },
    };
    if (data) {
      data.map(current => {
        if (current?.attributeSetIdentifier === 'service') {
          categories.main.data.push(current);
        } else {
          if (
            categories[current?.attributeValues?.offer_type?.value[0]?.value]
              ?.data
          ) {
            categories[
              current?.attributeValues?.offer_type?.value[0]?.value
            ].data.push(current);
          } else {
            categories[current?.attributeValues?.offer_type?.value[0]?.value] =
              {
                title: current?.attributeValues?.offer_type?.value[0]?.title,
                data: [current],
              };
          }
        }
      });
    }
    return Object.entries(categories).map(([key, value]) => value);
  }, [catalogData, masterData]);

  return (
    <Screen edges={['horizontal']}>
      <ServiceSelectButton />
      <ScrollView>
        {servicesByCategories.map((category, index) => (
          <ServiceSelectList
            key={category.title + index}
            categoryObj={category}
          />
        ))}
      </ScrollView>
    </Screen>
  );
};

export default CatalogScreen;
