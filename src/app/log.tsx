import { useCallback, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
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
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/components/app-state';
import { RideListItem } from '@/components/ride-list-item';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { seedRides } from '@/data/rides';
import { Ride } from '@/models/ride';

const formatLabel = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const formatVisitedAt = (value: Date) =>
  `${value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${value.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

const ridesWithSearchText = seedRides
  .map((ride) => ({
    ride,
    searchText: [
      ride.name,
      ParkLabels[ride.park],
      formatLabel(ride.attractionType),
      ...ride.warnings.map(formatLabel),
      LandLabels[ride.land],
    ]
      .join(' ')
      .toLocaleLowerCase(),
  }))
  .sort((first, second) => first.ride.name.localeCompare(second.ride.name));

export default function LogScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { rideId: rideIdParam } = useLocalSearchParams<{
    rideId?: string | string[];
  }>();
  const rideId = Array.isArray(rideIdParam) ? rideIdParam[0] : rideIdParam;
  const slideFromRight = Boolean(rideId);
  const panelOffset = slideFromRight
    ? Dimensions.get('window').width
    : Dimensions.get('window').height;
  const { addRideLog, previousTabPath, setTabBarHidden } = useAppState();
  const [panelPosition] = useState(() => new Animated.Value(panelOffset));
  const [query, setQuery] = useState('');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [waitTime, setWaitTime] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [visitedAt, setVisitedAt] = useState(() => new Date());
  const [draftVisitedAt, setDraftVisitedAt] = useState(() => new Date());
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabBarHidden(true);
      setQuery('');
      setSelectedRide(seedRides.find((ride) => ride.id === rideId) ?? null);
      setWaitTime('');
      setRating(null);
      setNotes('');
      setVisitedAt(new Date());
      setDateTimePickerVisible(false);
      panelPosition.setValue(panelOffset);
      Animated.spring(panelPosition, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 220,
      }).start();

      return () => setTabBarHidden(false);
    }, [
      panelPosition,
      panelOffset,
      setNotes,
      setQuery,
      setRating,
      setSelectedRide,
      setTabBarHidden,
      setWaitTime,
      setVisitedAt,
      setDateTimePickerVisible,
      rideId,
    ]),
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRides = normalizedQuery
    ? ridesWithSearchText
        .filter(({ searchText }) => searchText.includes(normalizedQuery))
        .map(({ ride }) => ride)
    : [];

  const closePanel = (destination: string) => {
    Animated.timing(panelPosition, {
      toValue: panelOffset,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.replace(destination as Href);
    });
  };

  const openDateTimePicker = () => {
    setDraftVisitedAt(visitedAt);
    setDateTimePickerVisible(true);
  };

  const closeDateTimePicker = () => setDateTimePickerVisible(false);

  const saveDateTimePicker = () => {
    setVisitedAt(draftVisitedAt);
    setDateTimePickerVisible(false);
  };

  const chooseRide = (ride: Ride) => {
    setSelectedRide(ride);
    setWaitTime('');
    setRating(null);
    setNotes('');
  };

  const saveRideLog = () => {
    if (!selectedRide) return;
    const now = new Date().toISOString();
    const parsedWaitTime = Number.parseInt(waitTime, 10);

    addRideLog({
      id: `${selectedRide.id}-${Date.now()}`,
      rideId: selectedRide.id,
      tripId: null,
      visitedAt: visitedAt.toISOString(),
      waitTimeMinutes:
        Number.isFinite(parsedWaitTime) && parsedWaitTime >= 0
          ? parsedWaitTime
          : null,
      notes: notes.trim(),
      photoUrl: null,
      rating,
      createdAt: now,
      updatedAt: now,
    });
    closePanel('/diary');
  };

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          backgroundColor: colors.background,
          transform: slideFromRight
            ? [{ translateX: panelPosition }]
            : [{ translateY: panelPosition }],
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View
          style={[
            styles.header,
            { height: 56 + insets.top, paddingTop: insets.top },
          ]}
        >
          <Pressable
            accessibilityRole='button'
            onPress={() => closePanel(previousTabPath)}
            style={styles.headerAction}
          >
            <Text style={[styles.cancelText, { color: colors.accent }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Log a Ride
          </Text>
          <View style={styles.headerAction} />
        </View>

        {selectedRide ? (
          <ScrollView
            contentContainerStyle={[
              styles.formContent,
              { paddingBottom: insets.bottom + 36 },
            ]}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              accessibilityRole='button'
              onPress={() => setSelectedRide(null)}
              style={styles.changeRideButton}
            >
              <Text style={[styles.changeRideText, { color: colors.accent }]}>
                Choose a different ride
              </Text>
            </Pressable>
            <Text style={[styles.rideTitle, { color: colors.text }]}>
              {selectedRide.name}
            </Text>
            <Text
              style={[styles.rideSubtitle, { color: colors.textSecondary }]}
            >
              {ParkLabels[selectedRide.park]} · {LandLabels[selectedRide.land]}
            </Text>

            <Pressable
              accessibilityLabel={`Change ride date and time, ${formatVisitedAt(visitedAt)}`}
              accessibilityRole='button'
              onPress={openDateTimePicker}
              style={styles.dateTimeButton}
            >
              <Text style={[styles.dateTimeValue, { color: colors.accent }]}>
                {formatVisitedAt(visitedAt)}
              </Text>
              <SymbolView
                name={{
                  ios: 'chevron.down',
                  android: 'expand_more',
                  web: 'expand_more',
                }}
                size={14}
                tintColor={colors.accent}
              />
            </Pressable>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Wait time (minutes)
            </Text>
            <TextInput
              accessibilityLabel='Wait time in minutes'
              keyboardType='number-pad'
              onChangeText={setWaitTime}
              placeholder='Optional'
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                { borderColor: '#dce7f2', color: colors.text },
              ]}
              value={waitTime}
            />

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Rating
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <View key={value} style={styles.ratingButton}>
                  {(() => {
                    const currentRating = rating ?? 0;
                    const isFull = currentRating >= value;
                    const isHalf = !isFull && currentRating >= value - 0.5;

                    return (
                      <>
                        <SymbolView
                          name={{
                            ios: isFull
                              ? 'star.fill'
                              : isHalf
                                ? 'star.leadinghalf.filled'
                                : 'star',
                            android: isFull
                              ? 'star'
                              : isHalf
                                ? 'star_half'
                                : 'star_outline',
                            web: isFull
                              ? 'star'
                              : isHalf
                                ? 'star_half'
                                : 'star_outline',
                          }}
                          size={28}
                          tintColor={
                            isFull || isHalf
                              ? colors.accent
                              : colors.textSecondary
                          }
                        />
                        <Pressable
                          accessibilityLabel={`Rate ${value - 0.5} out of 5`}
                          accessibilityRole='button'
                          accessibilityState={{
                            selected: rating === value - 0.5,
                          }}
                          onPress={() => setRating(value - 0.5)}
                          style={[
                            styles.ratingHalfButton,
                            styles.ratingHalfLeft,
                          ]}
                        />
                        <Pressable
                          accessibilityLabel={`Rate ${value} out of 5`}
                          accessibilityRole='button'
                          accessibilityState={{ selected: rating === value }}
                          onPress={() => setRating(value)}
                          style={[
                            styles.ratingHalfButton,
                            styles.ratingHalfRight,
                          ]}
                        />
                      </>
                    );
                  })()}
                </View>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Notes
            </Text>
            <TextInput
              accessibilityLabel='Ride notes'
              multiline
              onChangeText={setNotes}
              placeholder='Add a note about this ride'
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                styles.notesInput,
                { borderColor: '#dce7f2', color: colors.text },
              ]}
              textAlignVertical='top'
              value={notes}
            />

            <Pressable
              accessibilityRole='button'
              onPress={saveRideLog}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
            >
              <Text style={styles.saveButtonText}>Save Ride</Text>
            </Pressable>
          </ScrollView>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <SymbolView
                name={{
                  ios: 'magnifyingglass',
                  android: 'search',
                  web: 'search',
                }}
                size={20}
                tintColor={colors.textSecondary}
              />
              <TextInput
                accessibilityLabel='Name of ride'
                autoCapitalize='none'
                onChangeText={setQuery}
                placeholder='Name of ride'
                placeholderTextColor={colors.textSecondary}
                returnKeyType='search'
                style={[styles.searchInput, { color: colors.text }]}
                value={query}
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityLabel='Clear search'
                  accessibilityRole='button'
                  hitSlop={8}
                  onPress={() => setQuery('')}
                >
                  <SymbolView
                    name={{
                      ios: 'xmark.circle.fill',
                      android: 'cancel',
                      web: 'cancel',
                    }}
                    size={20}
                    tintColor={colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>
            <FlatList
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom + 24 },
              ]}
              data={filteredRides}
              keyboardShouldPersistTaps='handled'
              keyExtractor={(ride) => ride.id}
              ListEmptyComponent={
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  {normalizedQuery
                    ? 'No rides match your search.'
                    : 'Search by ride name, park, type, warning, or land.'}
                </Text>
              }
              renderItem={({ item }) => (
                <RideListItem ride={item} onPress={chooseRide} />
              )}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </KeyboardAvoidingView>
      <Modal
        animationType='slide'
        onRequestClose={closeDateTimePicker}
        transparent
        visible={dateTimePickerVisible}
      >
        <View style={styles.dateTimeModalRoot}>
          <Pressable
            accessibilityLabel='Close date and time picker'
            accessibilityRole='button'
            onPress={closeDateTimePicker}
            style={styles.dateTimeModalBackdrop}
          />
          <View
            style={[
              styles.dateTimeSheet,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            <View style={styles.dateTimeModalHeader}>
              <Pressable
                accessibilityRole='button'
                onPress={closeDateTimePicker}
                style={styles.dateTimeModalAction}
              >
                <Text style={{ color: colors.accent }}>Cancel</Text>
              </Pressable>
              <Text style={[styles.dateTimeModalTitle, { color: colors.text }]}>
                Edit ride time
              </Text>
              <Pressable
                accessibilityRole='button'
                onPress={saveDateTimePicker}
                style={[styles.dateTimeModalAction, styles.dateTimeDoneAction]}
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
              onValueChange={(_, date) => setDraftVisitedAt(date)}
              style={styles.datePickerHost}
              themeVariant='light'
              value={draftVisitedAt}
            />
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerAction: {
    justifyContent: 'center',
    minWidth: 72,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 20,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: 10,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    paddingTop: 28,
    textAlign: 'center',
  },
  formContent: {
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  changeRideButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingVertical: 4,
  },
  changeRideText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rideTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },
  rideSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  dateTimeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    minHeight: 36,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateTimeModalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  dateTimeSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  dateTimeModalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
  },
  dateTimeModalAction: {
    justifyContent: 'center',
    minHeight: 44,
    width: 72,
  },
  dateTimeDoneAction: {
    alignItems: 'flex-end',
  },
  dateTimeModalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  datePickerHost: {
    height: 220,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 24,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notesInput: {
    minHeight: 120,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 0,
  },
  ratingButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  ratingHalfButton: {
    height: 44,
    position: 'absolute',
    top: 0,
    width: 22,
  },
  ratingHalfLeft: {
    left: 0,
  },
  ratingHalfRight: {
    right: 0,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 52,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
