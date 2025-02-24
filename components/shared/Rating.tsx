import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {appColors} from '@/constants/Colors';
import Star from '@/assets/icons/Star.svg';
import {Paragraph} from '@/components/shared/Paragraph';

interface Props {
  rating: number;
  shorten?: boolean;
  color: string;
  starSize?: number;
}

const Rating: React.FC<Props> = ({
  rating,
  color,
  shorten = false,
  starSize = 15,
}) => {
  if (!shorten) {
    const stars = Array.from(Array(Math.round(rating)).keys());
    const emptyStars = Array.from(Array(5 - Math.round(rating)).keys());
    return (
      <View style={styles.starsContainer}>
        {stars.map((_, index) => (
          <Star width={starSize} height={starSize} key={index} fill={color} />
        ))}
        {emptyStars.map((_, index) => (
          <Star
            width={starSize}
            height={starSize}
            key={index}
            fill={appColors.gray}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.starsContainer}>
      <Star width={starSize} height={starSize} />
      <Paragraph color={'dark'} size={18} weight={'400'}>
        {rating}
      </Paragraph>
    </View>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
});

export default memo(Rating);
