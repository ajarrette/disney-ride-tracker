import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { RideTrip, RideTripInput } from '@/models/ride-trip';

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

const toDateString = (value: Date) =>
  [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-');

const formatDate = (value: Date) =>
  value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

type RideTripEditorProps = {
  initialTrip: RideTrip | null;
  onClose: () => void;
  onSave: (
    input: RideTripInput,
    existingTrip: RideTrip | null,
  ) => Promise<RideTrip>;
  onSaved: (trip: RideTrip) => void;
};

export function RideTripEditor({
  initialTrip,
  onClose,
  onSave,
  onSaved,
}: RideTripEditorProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialTrip?.name ?? '');
  const [startDate, setStartDate] = useState(
    parseDate(initialTrip?.startDate ?? toDateString(new Date())),
  );
  const [endDate, setEndDate] = useState(
    parseDate(initialTrip?.endDate ?? toDateString(new Date())),
  );
  const [activeDate, setActiveDate] = useState<'start' | 'end' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isValid = name.trim().length > 0 && startDate <= endDate;

  const save = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      const trip = await onSave(
        {
          name: name.trim(),
          startDate: toDateString(startDate),
          endDate: toDateString(endDate),
        },
        initialTrip,
      );
      onSaved(trip);
    } catch (error) {
      Alert.alert(
        'Unable to save trip',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeValue = activeDate === 'start' ? startDate : endDate;
  const setActiveValue = activeDate === 'start' ? setStartDate : setEndDate;

  return (
    <Modal animationType='slide' onRequestClose={onClose} transparent visible>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <Pressable
          accessibilityLabel='Close trip editor'
          accessibilityRole='button'
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.header}>
            <Pressable accessibilityRole='button' onPress={onClose}>
              <Text style={{ color: colors.accent }}>Cancel</Text>
            </Pressable>
            <Text style={[styles.title, { color: colors.text }]}>
              {initialTrip ? 'Edit trip' : 'New trip'}
            </Text>
            <Pressable
              accessibilityRole='button'
              disabled={!isValid || isSaving}
              onPress={() => void save()}
            >
              <Text
                style={{
                  color:
                    isValid && !isSaving ? colors.accent : colors.textSecondary,
                  fontWeight: '600',
                }}
              >
                Save
              </Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps='handled'>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              accessibilityLabel='Trip name'
              autoCapitalize='words'
              autoFocus={!initialTrip}
              maxLength={80}
              onChangeText={setName}
              placeholder='e.g. Summer vacation'
              placeholderTextColor={colors.textSecondary}
              returnKeyType='done'
              style={[
                styles.input,
                { borderColor: '#dce7f2', color: colors.text },
              ]}
              value={name}
            />
            <Text style={[styles.label, { color: colors.text }]}>Dates</Text>
            <View style={styles.dateRow}>
              <Pressable
                accessibilityLabel={`Start date, ${formatDate(startDate)}`}
                accessibilityRole='button'
                onPress={() =>
                  setActiveDate(activeDate === 'start' ? null : 'start')
                }
                style={[styles.dateButton, { borderColor: '#dce7f2' }]}
              >
                <Text
                  style={[styles.dateCaption, { color: colors.textSecondary }]}
                >
                  START
                </Text>
                <Text style={{ color: colors.text }}>
                  {formatDate(startDate)}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`End date, ${formatDate(endDate)}`}
                accessibilityRole='button'
                onPress={() =>
                  setActiveDate(activeDate === 'end' ? null : 'end')
                }
                style={[styles.dateButton, { borderColor: '#dce7f2' }]}
              >
                <Text
                  style={[styles.dateCaption, { color: colors.textSecondary }]}
                >
                  END
                </Text>
                <Text style={{ color: colors.text }}>
                  {formatDate(endDate)}
                </Text>
              </Pressable>
            </View>
            {activeDate && (
              <DateTimePicker
                accentColor={colors.accent}
                display='spinner'
                mode='date'
                onValueChange={(_, value) => setActiveValue(value)}
                style={styles.picker}
                themeVariant='light'
                value={activeValue}
              />
            )}
            {startDate > endDate && (
              <Text style={[styles.validation, { color: '#b42318' }]}>
                End date must be on or after the start date.
              </Text>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '86%',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 18 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateButton: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dateCaption: { fontSize: 9, fontWeight: '700' },
  picker: { height: 190, width: '100%' },
  validation: { fontSize: 12, marginTop: 8 },
});
