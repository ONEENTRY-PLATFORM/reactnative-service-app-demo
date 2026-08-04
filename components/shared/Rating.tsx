import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {appColors} from '@/lib/constants/Colors';
import Star from '@/assets/icons/Star.svg';
import {Paragraph} from '@/components/shared/Paragraph';

// StarsGroup parity from apps/nextjs-beauty: five stars, supports fractional
// values (e.g. 4.3) by overlaying an accent-colored strip clipped to the
// exact percentage. `shorten` keeps the previous single-star + numeric readout.
interface Props {
  rating: number;
  shorten?: boolean;
  color?: string;
  starSize?: number;
  totalStars?: number;
}

const Rating: React.FC<Props> = ({
  rating,
  color = appColors.primary,
  shorten = false,
  starSize = 15,
  totalStars = 5,
}) => {
  if (shorten) {
    return (
      <View style={styles.starsContainer}>
        <Star width={starSize} height={starSize} fill={color} />
        <Paragraph color={'charcoal'} size={starSize + 3} weight={'400'}>
          {rating.toFixed(1)}
        </Paragraph>
      </View>
    );
  }

  const clamped = Math.min(Math.max(rating, 0), totalStars);
  const fillPct = (clamped / totalStars) * 100;
  const groupWidth = totalStars * starSize + (totalStars - 1) * styles.starsContainer.gap;

  return (
    <View style={styles.starsContainer}>
      <View style={styles.baseRow}>
        {Array.from({length: totalStars}).map((_, i) => (
          <Star
            key={`empty-${i}`}
            width={starSize}
            height={starSize}
            fill={appColors.slate200}
          />
        ))}
      </View>
      <View
        style={[styles.overlayRow, {width: (groupWidth * fillPct) / 100}]}>
        {Array.from({length: totalStars}).map((_, i) => (
          <Star
            key={`filled-${i}`}
            width={starSize}
            height={starSize}
            fill={color}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    position: 'relative',
  },
  baseRow: {
    flexDirection: 'row',
    gap: 5,
  },
  overlayRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    gap: 5,
    overflow: 'hidden',
    height: '100%',
  },
});

export default memo(Rating);
