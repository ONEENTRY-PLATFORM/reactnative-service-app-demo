import {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '@/state/hooks';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import SectionTitle from '@/components/shared/SectionTitle';
import {selectMasterForOrder} from '@/state/reducers/OrderSlice';
import {appColors} from '@/lib/constants/Colors';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';

// Wizard step 3. Cross-filter (salon ∩ service) — matches the web
// SpecialistStep, minus the "Any specialist" affordance (the RN order shape
// requires a concrete master today; ANY_MASTER can be layered on later).
type Props = {
  onSelected: () => void;
};

const SpecialistStep = ({onSelected}: Props) => {
  const dispatch = useAppDispatch();
  const {masters} = useAppSelector(state => state.MastersReducer);
  const {salon, service, master: selectedMaster} = useAppSelector(
    state => state.OrderReducer,
  );
  const {select_master_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const filtered = useMemo(() => {
    if (!service && !salon) return masters;
    return masters.filter(m => {
      const services: {title?: string}[] = m.attributeValues?.master_services?.value ?? [];
      const masterSalons: {id?: number}[] =
        m.attributeValues?.master_salon?.value ?? [];
      const providesService = service
        ? services.some(v => v?.title === service?.localizeInfos?.title)
        : true;
      const worksAtSalon = salon
        ? masterSalons.some(v => v?.id === salon.id)
        : true;
      return providesService && worksAtSalon;
    });
  }, [masters, service, salon]);

  const handlePress = (master: IAdminEntity) => {
    dispatch(selectMasterForOrder(master));
    onSelected();
  };

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={{marginBottom: 20}}>
          <SectionTitle title={select_master_text} />
        </View>
      }
      ListEmptyComponent={
        <Paragraph color={'ink'} size={14} style={{textAlign: 'center', marginTop: 40}}>
          No specialists available for this selection.
        </Paragraph>
      }
      contentContainerStyle={{gap: 12, paddingBottom: 40}}
      renderItem={({item}) => {
        const isPicked = selectedMaster?.id === item.id;
        const image = item.attributeValues?.master_image?.value?.[0]?.downloadLink;
        const name = item.attributeValues?.master_name?.value;
        const rating = Number(item.attributeValues?.master_rating?.value ?? 0);
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
            <View style={{flex: 1, gap: 4}}>
              <Paragraph color={'charcoal'} size={16} weight={'700'}>
                {String(name ?? '')}
              </Paragraph>
              {rating > 0 ? <Rating rating={rating} starSize={14} /> : null}
            </View>
          </CardBase>
        );
      }}
    />
  );
};

export default SpecialistStep;
