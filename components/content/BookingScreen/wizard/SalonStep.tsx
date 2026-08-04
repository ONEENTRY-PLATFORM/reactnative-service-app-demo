import {FlatList, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import CardBase from '@/components/shared/CardBase';
import {Paragraph} from '@/components/shared/Paragraph';
import CustomImage from '@/components/shared/CustomImage';
import SectionTitle from '@/components/shared/SectionTitle';
import {selectSalonForOrder} from '@/state/reducers/OrderSlice';
import {appColors} from '@/lib/constants/Colors';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';

// Wizard step 1 (salon-first flow). Full-screen card list instead of the
// dropdown used elsewhere. Existing shared/SalonPicker is kept for
// home_mobile / masters/index — different UX context (compact selector).
type Props = {
  onSelected: () => void;
};

const SalonStep = ({onSelected}: Props) => {
  const dispatch = useAppDispatch();
  const {salons} = useAppSelector(state => state.SalonsReducer);
  const selected = useAppSelector(state => state.OrderReducer.salon);
  const {select_salon_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const handlePress = (salon: IPagesEntity) => {
    dispatch(selectSalonForOrder(salon));
    onSelected();
  };

  return (
    <FlatList
      data={salons}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={{marginBottom: 20}}>
          <SectionTitle title={select_salon_text} />
        </View>
      }
      contentContainerStyle={{gap: 12, paddingBottom: 40}}
      renderItem={({item}) => {
        const isPicked = selected?.id === item.id;
        // CMS attribute is `salon_images` (groupOfImages) — same key the web
        // salon page reads from. Older `salon_image` is kept as a fallback in
        // case an older content variant is deployed.
        const salonImages: any =
          item.attributeValues?.salon_images?.value ??
          item.attributeValues?.salon_image?.value;
        const image = Array.isArray(salonImages)
          ? salonImages[0]?.downloadLink
          : (salonImages as any)?.downloadLink;
        const address = item.attributeValues?.salon_address?.value;
        return (
          <CardBase
            outline
            outlineColor={isPicked ? appColors.primary : appColors.slate200}
            onPress={() => handlePress(item)}
            className={'flex-row items-center gap-x-4 p-3'}
            touchableOpacityProps={{className: 'rounded-md'}}>
            {image ? (
              <CustomImage
                width={72}
                height={72}
                className={'rounded-md'}
                style={{objectFit: 'cover'}}
                uri={image}
              />
            ) : (
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  backgroundColor: appColors.slate150,
                }}
              />
            )}
            <View style={{flex: 1}}>
              <Paragraph color={'charcoal'} size={16} weight={'700'}>
                {item.localizeInfos?.title}
              </Paragraph>
              {address ? (
                <Paragraph color={'ink'} size={13} style={{marginTop: 4}}>
                  {String(address)}
                </Paragraph>
              ) : null}
            </View>
          </CardBase>
        );
      }}
    />
  );
};

export default SalonStep;
