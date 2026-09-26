import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type RideLogDateTimePickerProps = {
  bottomInset: number;
  onChange: (date: Date) => void;
  onClose: () => void;
  onSave: () => void;
  value: Date;
  visible: boolean;
};

export function RideLogDateTimePicker({
  bottomInset,
  onChange,
  onClose,
  onSave,
  value,
  visible,
}: RideLogDateTimePickerProps) {
  const colors = Colors.light;

  return (
    <Modal
      animationType='slide'
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityLabel='Close date and time picker'
          accessibilityRole='button'
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: bottomInset + 12,
            },
          ]}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole='button'
              onPress={onClose}
              style={styles.action}
            >
              <Text style={{ color: colors.accent }}>Cancel</Text>
            </Pressable>
            <Text style={[styles.title, { color: colors.text }]}>
              Edit ride time
            </Text>
            <Pressable
              accessibilityRole='button'
              onPress={onSave}
              style={[styles.action, styles.doneAction]}
            >
              <Text style={{ color: colors.accent, fontWeight: '600' }}>
                Done
              </Text>
            </Pressable>
          </View>
          <DateTimePicker
            accentColor={colors.accent}
            display='spinner'
            mode='datetime'
            onValueChange={(_, date) => onChange(date)}
            style={styles.picker}
            themeVariant='light'
            value={value}
          />
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
  action: {
    justifyContent: 'center',
    minHeight: 44,
    width: 72,
  },
  doneAction: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  picker: {
    height: 220,
    width: '100%',
  },
});
