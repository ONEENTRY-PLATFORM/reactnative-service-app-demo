import React, {memo, useMemo} from 'react';
import {TextStyle, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

type Props = {
  price?: number;
  size?: 'sm' | 'md' | 'lg';
  sale?: number;
  currency: string;
  color?: string;
  style?: TextStyle;
  className?: string;
};

const textSizes = {
  sm: 14,
  md: 18,
  lg: 20,
};

const Price: React.FC<Props> = ({
  price,
  currency,
  size = 'sm',
  style,
  sale,
  color,
  className,
}) => {
  const qualifiedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'usd',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  }, [currency, price]);

  return (
    <>
      {sale && price ? (
        <View className={'flex-row items-center gap-x-1.5'}>
          <Paragraph
            className={className}
            style={{color: color || appColors.primary}}
            size={textSizes[size]}
            weight="bold">
            {qualifiedPrice}
          </Paragraph>
          <Paragraph
            weight="regular"
            color={'gray'}
            size={textSizes[size]}
            style={[{textDecorationLine: 'line-through'}]}>
            ${parseInt(price) + parseInt(sale)}
          </Paragraph>
        </View>
      ) : (
        <Paragraph
          style={{color: color || appColors.primary}}
          size={textSizes[size]}
          weight="bold">
          {qualifiedPrice}
        </Paragraph>
      )}
    </>
  );
};

export default memo(Price);
