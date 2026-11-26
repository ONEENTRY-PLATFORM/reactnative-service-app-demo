import React from 'react';
import {Modal, View, TouchableOpacity, FlatList} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import CardBase from '@/components/shared/CardBase';
import Location from '@/assets/icons/Location.svg';
import X from '@/assets/icons/x.svg';
import {appColors} from '@/lib/constants/Colors';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {attrText} from '@/lib/oneentry/attributes';
import {useAppSelector} from '@/state/hooks';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectSalon: (salon: IPagesEntity) => void;
  masterSalons: IPagesEntity[];
};

const SalonCard = ({
  salon,
  onPress,
}: {
  salon: IPagesEntity;
  onPress: () => void;
}) => {
  return (
    <CardBase
      onPress={onPress}
      className="mb-3"
      outline
      outlineColor={appColors.gray}>
      <View className="flex-row items-center p-4 gap-3">
        <Location />
        <View className="flex-1">
          <Paragraph color="dark" size={16} weight="600">
            {salon.localizeInfos?.title}
          </Paragraph>
          <Paragraph color="gray" size={14}>
            {attrText(salon.attributeValues?.salon_address) || 'No address'}
          </Paragraph>
        </View>
      </View>
    </CardBase>
  );
};

const SalonSelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectSalon,
  masterSalons,
}) => {
  const {select_salon_text, no_salons_text} = useAppSelector(
    state => state.SystemContentReducer.content,
  );

  const handleSalonSelect = (salon: IPagesEntity) => {
    onSelectSalon(salon);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4 max-h-[80%]">
          <View className="flex-row items-center justify-between mb-6">
            <Paragraph color="dark" size={20} weight="600">
              {select_salon_text}
            </Paragraph>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-gray">
              <X width={14} height={14} />
            </TouchableOpacity>
          </View>

          {masterSalons.length > 0 ? (
            <FlatList
              data={masterSalons}
              contentContainerStyle={{gap: 10}}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <SalonCard
                  salon={item}
                  onPress={() => handleSalonSelect(item)}
                />
              )}
            />
          ) : (
            <View className="py-8 items-center">
              <Paragraph color="gray" size={16}>
                {no_salons_text}
              </Paragraph>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SalonSelectionModal;
