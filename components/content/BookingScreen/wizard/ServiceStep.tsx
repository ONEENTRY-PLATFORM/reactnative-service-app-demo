import {useState} from 'react';
import {FlatList, TouchableOpacity, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import {Paragraph} from '@/components/shared/Paragraph';
import SectionTitle from '@/components/shared/SectionTitle';
import FlexLoader from '@/components/shared/FlexLoader';
import {appColors} from '@/lib/constants/Colors';
import {useGetProductsByPageUrlQuery} from '@/api';
import {selectServiceForOrder} from '@/state/reducers/OrderSlice';
import {IProductsEntity} from 'oneentry/dist/products/productsInterfaces';
import ChevronDown from '@/assets/icons/ChevronDownGray.svg';

// Wizard step 2. Category picker + inline product list per expanded category —
// avoids the navigation jump that the shared ServicePicker makes to
// /catalog/[marker]. Multi-service selection stays out of scope for the first
// iteration (the web supports it, but the RN order shape only carries one
// service today).
type Props = {
  onSelected: () => void;
};

const CategoryProducts = ({
  pageUrl,
  selectedServiceId,
  onSelected,
}: {
  pageUrl: string;
  selectedServiceId?: number;
  onSelected: (service: IProductsEntity) => void;
}) => {
  const {data, isLoading} = useGetProductsByPageUrlQuery({pageUrl});
  if (isLoading) {
    return <FlexLoader />;
  }
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <View style={{gap: 6, paddingLeft: 12, paddingBottom: 8}}>
      {data.map(item => {
        const active = item.id === selectedServiceId;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelected(item)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: active ? appColors.primary : appColors.slate200,
              backgroundColor: active ? appColors.primary : appColors.white,
            }}
            activeOpacity={0.8}>
            <Paragraph
              color={active ? 'white' : 'charcoal'}
              size={15}
              weight={active ? '700' : '400'}>
              {item.localizeInfos?.title}
            </Paragraph>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ServiceStep = ({onSelected}: Props) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(
    state => state.CatalogCategoriesReducer.categories,
  );
  const selectedService = useAppSelector(state => state.OrderReducer.service);
  const {select_service_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );
  const [expandedPageUrl, setExpandedPageUrl] = useState<string | null>(null);

  return (
    <FlatList
      data={categories}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={{marginBottom: 20}}>
          <SectionTitle title={select_service_text} />
        </View>
      }
      contentContainerStyle={{paddingBottom: 40, gap: 8}}
      renderItem={({item}) => {
        const expanded = expandedPageUrl === item.pageUrl;
        return (
          <View
            style={{
              borderWidth: 1,
              borderColor: appColors.slate200,
              borderRadius: 14,
              overflow: 'hidden',
            }}>
            <TouchableOpacity
              onPress={() =>
                setExpandedPageUrl(expanded ? null : item.pageUrl)
              }
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
              activeOpacity={0.7}>
              <Paragraph color={'charcoal'} size={16} weight={'700'}>
                {item.localizeInfos?.title}
              </Paragraph>
              <View
                style={{
                  transform: [{rotate: expanded ? '180deg' : '0deg'}],
                }}>
                <ChevronDown />
              </View>
            </TouchableOpacity>
            {expanded ? (
              <CategoryProducts
                pageUrl={item.pageUrl}
                selectedServiceId={selectedService?.id}
                onSelected={service => {
                  dispatch(selectServiceForOrder(service));
                  onSelected();
                }}
              />
            ) : null}
          </View>
        );
      }}
    />
  );
};

export default ServiceStep;
