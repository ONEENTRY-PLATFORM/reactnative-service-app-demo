import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronDown, Palette} from 'lucide-react-native';
import {Paragraph} from '@/components/shared/Paragraph';
import {appColors} from '@/lib/constants/Colors';

// Pill-shaped salon picker matching the web mobile design: rounded white pill,
// palette icon on the left, label in the middle, chevron on the right. Tapping
// opens a full-width dropdown sheet.

export type SalonOption = {id: number | null; name: string; address?: string};

interface Props {
  options: SalonOption[]; // does not include the "all" pseudo-option
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  allLabel?: string;
}

const SalonSelector: React.FC<Props> = ({
  options,
  selectedId,
  onSelect,
  allLabel = 'All studios',
}) => {
  const [open, setOpen] = useState(false);

  const items: SalonOption[] = [
    {id: null, name: allLabel},
    ...options,
  ];
  const active = items.find(o => o.id === selectedId) ?? items[0];

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        style={styles.trigger}>
        <View style={styles.iconBubble}>
          <Palette size={14} color={appColors.white} />
        </View>
        <Paragraph
          size={14}
          weight={'600'}
          color={'charcoal'}
          style={{flex: 1}}>
          {active.name}
        </Paragraph>
        <ChevronDown size={18} color={appColors.gray} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType={'fade'}
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Paragraph
              size={11}
              weight={'700'}
              color={'gray'}
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 8,
              }}>
              Studio
            </Paragraph>
            <ScrollView style={{maxHeight: 360}}>
              {items.map(opt => {
                const isActive = opt.id === selectedId;
                return (
                  <TouchableOpacity
                    key={String(opt.id ?? 'all')}
                    onPress={() => {
                      onSelect(opt.id);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.item,
                      isActive && {backgroundColor: 'rgba(246,14,251,0.06)'},
                    ]}>
                    <View style={{flex: 1}}>
                      <Paragraph
                        size={15}
                        weight={isActive ? '700' : '600'}
                        color={isActive ? 'primary' : 'charcoal'}>
                        {opt.name}
                      </Paragraph>
                      {opt.address ? (
                        <Paragraph
                          size={12}
                          color={'gray'}
                          style={{marginTop: 2}}>
                          {opt.address}
                        </Paragraph>
                      ) : null}
                    </View>
                    {isActive ? <View style={styles.dot} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: appColors.slate150,
    backgroundColor: appColors.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  iconBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
    maxHeight: '80%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.primary,
  },
});

export default SalonSelector;
