import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResortPreferences } from '@/components/resort-preferences-provider';
import { ResortOptions } from '@/constants/resorts';
import { Colors } from '@/constants/theme';

type ResortPickerSheetProps = {
  onClose: () => void;
  visible: boolean;
};

export function ResortPickerSheet({
  onClose,
  visible,
}: ResortPickerSheetProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { selectedResortId, setSelectedResortId } = useResortPreferences();

  return (
    <Modal
      animationType='slide'
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityLabel='Close resort choices'
          accessibilityRole='button'
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Choose a resort
            </Text>
            <Pressable
              accessibilityLabel='Close resort choices'
              accessibilityRole='button'
              hitSlop={8}
              onPress={onClose}
            >
              <SymbolView
                name='xmark'
                size={18}
                tintColor={colors.textSecondary}
              />
            </Pressable>
          </View>
          {ResortOptions.map((option) => {
            const isSelected = selectedResortId === option.id;
            const label = option.id === 'all' ? 'All parks' : option.label;
            return (
              <Pressable
                accessibilityLabel={label}
                accessibilityRole='button'
                accessibilityState={{ selected: isSelected }}
                key={option.id}
                onPress={() => {
                  setSelectedResortId(option.id);
                  onClose();
                }}
                style={styles.choice}
              >
                <Text
                  style={[
                    styles.choiceText,
                    { color: isSelected ? colors.accent : colors.text },
                  ]}
                >
                  {label}
                </Text>
                {isSelected && (
                  <SymbolView
                    name='checkmark'
                    size={17}
                    tintColor={colors.accent}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  choice: {
    alignItems: 'center',
    borderBottomColor: '#e8edf2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  choiceText: {
    fontSize: 15,
  },
});