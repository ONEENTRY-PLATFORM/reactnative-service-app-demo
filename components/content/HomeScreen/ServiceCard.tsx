import React from 'react';
import {StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {IPagesEntity} from 'oneentry/dist/pages/pagesInterfaces';
import {appColors} from '@/lib/constants/Colors';
import CardBase from '@/components/shared/CardBase';
import CategoryIcon from '@/components/shared/CategoryIcon';

// Category tile on the home SERVICE grid. Matches nextjs-beauty's
// CategoryTile 1:1 — white circle with an ink outline, sprite icon + label
// baked in from ICONS_CATEGORY.svg. No external Paragraph label under the
// circle: the label is already part of the sprite (see the web mock).
type Props = {
  service: IPagesEntity;
};

const ServiceCard: React.FC<Props> = ({service}) => {
  const title = (service?.localizeInfos?.title ?? '') as string;
  return (
    <CardBase
      onPress={() => {
        router.push({
          pathname: `/catalog/${service.pageUrl}`,
          params: {
            title,
            uniqueDate: Date.now(),
          },
        });
      }}>
      <View style={styles.tile}>
        <CategoryIcon
          pageUrl={service.pageUrl}
          size={108}
          color={appColors.ink}
        />
      </View>
    </CardBase>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: appColors.ink,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default ServiceCard;
