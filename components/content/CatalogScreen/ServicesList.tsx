import React, {useCallback, useEffect, useMemo} from 'react';
import {useFocusEffect, useLocalSearchParams, useNavigation} from 'expo-router';
import {
  useLazyGetProductsByIdsQuery,
  useLazyGetProductsByPageUrlQuery,
} from '@/api';
import {useAppSelector} from '@/state/hooks';
import {getMasterById} from '@/state/reducers/MastersSlice';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import ServicesByCategoryList from '@/components/content/CatalogScreen/ServicesByCategoryList';
import {ScrollView} from 'react-native';
import FlexLoader from '@/components/shared/FlexLoader';

type Props = Record<string, never>;

const ServicesList: React.FC<Props> = () => {
  const {marker, id, title, uniqueDate} = useLocalSearchParams();
  const [getData, {data: catalogData, isLoading, reset: resetUrlsQuery}] =
    useLazyGetProductsByPageUrlQuery({});
  const [
    getMasterProducts,
    {data: masterData, isLoading: isLoadingMasters, reset: resetMastersQuery},
  ] = useLazyGetProductsByIdsQuery();
  const master = useAppSelector(state =>
    getMasterById(state, parseInt(id as string)),
  );

  const navigation = useNavigation();

  const loadData = useCallback(() => {
    try {
      if (master) {
        const ids = master?.attributeValues?.master_services?.value
          ?.map((service: any) => {
            if (typeof service.id === 'string') {
              const serviceId = service?.id?.split('-')[2];
              return parseInt(serviceId);
            }
          })
          ?.filter((id: number) => id !== undefined);
        //get masters products
        getMasterProducts({ids});
      } else {
        //get products by url
        getData({pageUrl: marker as string});
      }
    } catch (e) {
      console.log(e);
    }
  }, [master, marker, getMasterProducts, getData]);

  useFocusEffect(
    useCallback(() => {
      loadData();

      return () => {
        resetMastersQuery();
        resetUrlsQuery();
      };
    }, [loadData, resetMastersQuery, resetUrlsQuery]),
  );

  // Set the header title
  useEffect(() => {
    navigation.setOptions({
      title,
    });
  }, [navigation, title]);

  useEffect(() => {
    loadData();
  }, [loadData, uniqueDate]);

  const servicesByCategories = useMemo(() => {
    const data = catalogData || masterData;
    const categories: {
      [key: string]: {
        title: string;
        data: IProductsEntity[];
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

  if (isLoading || isLoadingMasters) {
    return <FlexLoader height={550} />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {servicesByCategories.map((category, index) => (
        <ServicesByCategoryList
          key={category.title + index}
          categoryObj={category}
        />
      ))}
    </ScrollView>
  );
};

export default ServicesList;
