import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideTripEditor } from '@/components/ride-trip-editor';
import { useRideTrips } from '@/components/ride-trips-provider';
import { Colors } from '@/constants/theme';
import { RideTrip, RideTripInput } from '@/models/ride-trip';

type RideTripSelectorProps = {
  allowNone?: boolean;
  editable?: boolean;
  isCompact?: boolean;
  label: string;
  noneLabel: string;
  noneSubtitle?: string;
  onSelect: (tripId: string | null) => void;
  selectedTripId: string | null;
  showFieldLabel?: boolean;
};

const formatRange = (trip: RideTrip) => {
  const start = new Date(`${trip.startDate}T12:00:00`).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric' },
  );
  const end = new Date(`${trip.endDate}T12:00:00`).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' },
  );
  return `${start} - ${end}`;
};

export function RideTripSelector({
  allowNone = false,
  editable = false,
  isCompact = false,
  label,
  noneLabel,
  noneSubtitle = 'Keep this ride outside a trip',
  onSelect,
  selectedTripId,
  showFieldLabel = false,
}: RideTripSelectorProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { trips, isLoading, createTrip, updateTrip } = useRideTrips();
  const [isVisible, setIsVisible] = useState(false);
  const [editorTrip, setEditorTrip] = useState<RideTrip | null | undefined>();
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
  const selectedLabel =
    editable && isLoading ? 'Loading trips' : (selectedTrip?.name ?? noneLabel);
  const triggerLabel =
    isCompact && !selectedTrip ? noneLabel.toLocaleUpperCase() : selectedLabel;

  const saveTrip = (input: RideTripInput, existingTrip: RideTrip | null) =>
    existingTrip
      ? updateTrip({
          ...existingTrip,
          ...input,
          updatedAt: new Date().toISOString(),
        })
      : createTrip(input);

  return (
    <>
      {showFieldLabel && (
        <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      )}
      <Pressable
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityRole='button'
        onPress={() => setIsVisible(true)}
        style={[
          isCompact ? styles.compactTrigger : styles.trigger,
          showFieldLabel && styles.fieldTrigger,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            isCompact ? styles.compactValue : styles.triggerValue,
            { color: isCompact ? colors.textSecondary : colors.accent },
          ]}
        >
          {triggerLabel}
        </Text>
        <SymbolView
          name={{
            ios: 'chevron.down',
            android: 'expand_more',
            web: 'expand_more',
          }}
          size={isCompact ? 12 : 14}
          tintColor={isCompact ? colors.textSecondary : colors.accent}
        />
      </Pressable>

      <Modal
        animationType='slide'
        onRequestClose={() => setIsVisible(false)}
        transparent
        visible={isVisible}
      >
        <View style={styles.root}>
          <Pressable
            accessibilityLabel='Close trip list'
            accessibilityRole='button'
            onPress={() => setIsVisible(false)}
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
                {editable ? 'Choose a trip' : 'Ride story'}
              </Text>
              <Pressable
                accessibilityLabel='Close trip list'
                accessibilityRole='button'
                hitSlop={8}
                onPress={() => setIsVisible(false)}
              >
                <SymbolView
                  name='xmark'
                  size={18}
                  tintColor={colors.textSecondary}
                />
              </Pressable>
            </View>
            <ScrollView style={styles.list}>
              {allowNone && (
                <TripChoice
                  isSelected={selectedTripId === null}
                  label={noneLabel}
                  onPress={() => {
                    onSelect(null);
                    setIsVisible(false);
                  }}
                  subtitle={noneSubtitle}
                />
              )}
              {isLoading ? (
                <Text style={[styles.empty, { color: colors.textSecondary }]}>
                  Loading trips…
                </Text>
              ) : trips.length === 0 ? (
                <Text style={[styles.empty, { color: colors.textSecondary }]}>
                  No trips yet.
                </Text>
              ) : (
                trips.map((trip) => (
                  <View key={trip.id} style={styles.tripRow}>
                    <Pressable
                      accessibilityLabel={`Select trip ${trip.name}`}
                      accessibilityRole='button'
                      onPress={() => {
                        onSelect(trip.id);
                        setIsVisible(false);
                      }}
                      style={styles.tripChoice}
                    >
                      <View style={styles.tripCopy}>
                        <Text
                          numberOfLines={1}
                          style={[styles.tripName, { color: colors.text }]}
                        >
                          {trip.name}
                        </Text>
                        <Text
                          style={[
                            styles.tripDates,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatRange(trip)}
                        </Text>
                      </View>
                      {selectedTripId === trip.id && (
                        <SymbolView
                          name='checkmark'
                          size={17}
                          tintColor={colors.accent}
                        />
                      )}
                    </Pressable>
                    {editable && (
                      <Pressable
                        accessibilityLabel={`Edit trip ${trip.name}`}
                        accessibilityRole='button'
                        hitSlop={8}
                        onPress={() => {
                          setIsVisible(false);
                          setEditorTrip(trip);
                        }}
                        style={styles.editButton}
                      >
                        <SymbolView
                          name='pencil'
                          size={16}
                          tintColor={colors.accent}
                        />
                      </Pressable>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            {editable && (
              <Pressable
                accessibilityRole='button'
                onPress={() => {
                  setIsVisible(false);
                  setEditorTrip(null);
                }}
                style={[styles.addButton, { borderColor: colors.accent }]}
              >
                <SymbolView name='plus' size={16} tintColor={colors.accent} />
                <Text style={[styles.addText, { color: colors.accent }]}>
                  New trip
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
      {editorTrip !== undefined && (
        <RideTripEditor
          initialTrip={editorTrip}
          onClose={() => {
            setEditorTrip(undefined);
            setIsVisible(true);
          }}
          onSave={saveTrip}
          onSaved={(trip) => {
            setEditorTrip(undefined);
            if (!editorTrip) onSelect(trip.id);
          }}
        />
      )}
    </>
  );
}

function TripChoice({
  isSelected,
  label,
  onPress,
  subtitle,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
  subtitle: string;
}) {
  const colors = Colors.light;
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={styles.choice}
    >
      <View style={styles.tripCopy}>
        <Text style={[styles.tripName, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.tripDates, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      {isSelected && (
        <SymbolView name='checkmark' size={17} tintColor={colors.accent} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 18,
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
  },
  fieldTrigger: {
    borderColor: '#dce7f2',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  triggerValue: { fontSize: 15, fontWeight: '600' },
  compactTrigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    maxWidth: '50%',
    minHeight: 40,
  },
  compactValue: { fontSize: 10, fontWeight: '700' },
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '82%',
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
  list: { flexGrow: 0, marginTop: 8 },
  empty: { fontSize: 14, paddingVertical: 20, textAlign: 'center' },
  choice: {
    alignItems: 'center',
    borderBottomColor: '#e8edf2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 62,
    paddingVertical: 8,
  },
  tripRow: {
    alignItems: 'center',
    borderBottomColor: '#e8edf2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 62,
  },
  tripChoice: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingRight: 12,
  },
  tripCopy: { flex: 1, gap: 3 },
  tripName: { fontSize: 15, fontWeight: '600' },
  tripDates: { fontSize: 12 },
  editButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 40,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 48,
  },
  addText: { fontSize: 14, fontWeight: '600' },
});
