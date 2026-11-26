import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {IAdminEntity} from 'oneentry/dist/admins/adminsInterfaces';
import {getAttributeFile} from 'oneentry';
import {router} from 'expo-router';
import CardBase from '@/components/shared/CardBase';
import CustomImage from '@/components/shared/CustomImage';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';

// Home masters carousel. Card now includes portrait + name + rating so the
// section actually communicates who the specialist is, mirroring the web
// MastersFeed layout on nextjs-beauty.
const CARD_WIDTH = 150;
const CARD_HEIGHT = 200;

const MasterCard = ({master}: {master: IAdminEntity}) => {
  const image = getAttributeFile(master?.attributeValues?.master_image)
    ?.downloadLink;
  const name = (master?.attributeValues?.master_name?.value ?? '') as string;
  const rating = Number(master?.attributeValues?.master_rating?.value ?? 0);
  return (
    <CardBase
      onPress={() => router.navigate(`/(tabs)/masters/${master.id}`)}
      className={'gap-2'}>
      <View style={styles.imageWrap}>
        {image ? (
          <CustomImage
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            uri={image}
            style={{objectFit: 'cover'}}
            className={'rounded-lg'}
          />
        ) : (
          <View
            style={[
              styles.imageFallback,
              {width: CARD_WIDTH, height: CARD_HEIGHT},
            ]}>
            <Paragraph
              family={'league-gothic'}
              color={'white'}
              size={42}
              style={{textAlign: 'center'}}>
              {name.trim().charAt(0).toUpperCase() || '?'}
            </Paragraph>
          </View>
        )}
      </View>
      <Paragraph
        color={'charcoal'}
        size={14}
        weight={'700'}
        numberOfLines={1}
        style={{marginTop: 4}}>
        {name}
      </Paragraph>
      {rating > 0 ? <Rating rating={rating} starSize={13} /> : null}
    </CardBase>
  );
};

const MastersList: React.FC = () => {
  const masters = useAppSelector(state => state.MastersReducer.masters);

  if (!masters || masters.length === 0) {
    return null;
  }

  return (
    <FlatList
      horizontal
      data={masters.slice(0, 6)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{gap: 12}}
      renderItem={({item}) => <MasterCard master={item} />}
      keyExtractor={item => String(item.id)}
    />
  );
};

const styles = StyleSheet.create({
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageFallback: {
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});

export default MastersList;
