import {StyleSheet, View} from 'react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import Rating from '@/components/shared/Rating';
import SectionTitle from '@/components/shared/SectionTitle';
import {appColors} from '@/lib/constants/Colors';
import {useAppSelector} from '@/state/hooks';
import {attrText} from '@/lib/oneentry/attributes';
import {useReviews} from '@/lib/oneentry/reviews';

const LATEST_COUNT = 3;

type Props = {
  title: string;
};

// Latest approved customer reviews from the `master_review` form, the same
// source nextjs-beauty uses. The section title lives here so the whole block
// disappears when there is nothing real to show — no placeholder testimonials.
const ReviewsCarousel = ({title}: Props) => {
  const {reviews} = useReviews();
  const masters = useAppSelector(state => state.MastersReducer.masters);

  const latest = reviews.slice(0, LATEST_COUNT);
  if (latest.length === 0) {
    return null;
  }

  const masterName = (id: number) => {
    const master = masters.find(m => m.id === id);
    return master ? attrText(master.attributeValues?.master_name) : '';
  };

  return (
    <View style={{gap: 16}}>
      <SectionTitle title={title} />
      <View style={{gap: 12}}>
        {latest.map(review => {
          const specialist = masterName(review.masterId);
          return (
            <View key={review.id} style={styles.card}>
              <Rating rating={review.rating} starSize={14} />
              <Paragraph
                color={'ink'}
                size={14}
                style={{marginTop: 8, marginBottom: 12}}>
                “{review.text}”
              </Paragraph>
              <Paragraph color={'charcoal'} size={13} weight={'700'}>
                — {review.author || 'Client'}
                {specialist ? (
                  <Paragraph color={'gray'} size={13} weight={'400'}>
                    {`  ·  ${specialist}`}
                  </Paragraph>
                ) : null}
              </Paragraph>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: appColors.slate150,
  },
});

export default ReviewsCarousel;
