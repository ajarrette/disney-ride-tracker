import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/components/app-state';
import { useRideCatalog } from '@/components/ride-catalog-provider';
import { RideListItem } from '@/components/ride-list-item';
import { RideLogPhotos } from '@/components/ride-log-photos';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Colors, Fonts } from '@/constants/theme';
import { getRideBackground } from '@/data/ride-images';
import { Ride } from '@/models/ride';
import { getRideLogPhotos } from '@/models/ride-log';

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 20 * 1024 * 1024;

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

export default function LogScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { rideId: rideIdParam, logId: logIdParam } = useLocalSearchParams<{
    rideId?: string | string[];
    logId?: string | string[];
  }>();
  const rideId = Array.isArray(rideIdParam) ? rideIdParam[0] : rideIdParam;
  const logId = Array.isArray(logIdParam) ? logIdParam[0] : logIdParam;
  const slideFromRight = Boolean(rideId);
  const panelOffset = slideFromRight
    ? Dimensions.get('window').width
    : Dimensions.get('window').height;
  const {
    addRideLog,
    addRecentRideSearch,
    updateRideLog,
    removeRideLog,
    previousTabPath,
    rideLogs,
    recentRideSearches,
    setTabBarHidden,
  } = useAppState();
  const { rides, isLoading, hasError } = useRideCatalog();
  const rideLogsRef = useRef(rideLogs);
  const ridesRef = useRef(rides);
  const pendingRideIdRef = useRef<string | null>(null);
  const existingLog = rideLogs.find((log) => log.id === logId);
  const [panelPosition] = useState(() => new Animated.Value(panelOffset));
  const [scrollY] = useState(() => new Animated.Value(0));
  const [query, setQuery] = useState('');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [waitTime, setWaitTime] = useState('');
  const [lightningLaneUsed, setLightningLaneUsed] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [visitedAt, setVisitedAt] = useState(() => new Date());
  const [draftVisitedAt, setDraftVisitedAt] = useState(() => new Date());
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const rideBackground = selectedRide
    ? getRideBackground(selectedRide.park, selectedRide.backgroundUrl)
    : null;
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [140, 220],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const headerForegroundOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [140, 220],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    rideLogsRef.current = rideLogs;
  }, [rideLogs]);

  useEffect(() => {
    ridesRef.current = rides;
    if (!pendingRideIdRef.current) return;

    const pendingRide = rides.find(
      (ride) => ride.id === pendingRideIdRef.current,
    );
    if (pendingRide) {
      setSelectedRide(pendingRide);
      pendingRideIdRef.current = null;
    }
  }, [rides]);

  useFocusEffect(
    useCallback(() => {
      if (logId) Keyboard.dismiss();
      setTabBarHidden(true);
      setQuery('');
      const log = rideLogsRef.current.find((entry) => entry.id === logId);
      const selectedRideId = log?.rideId ?? rideId;
      const initialRide = ridesRef.current.find(
        (ride) => ride.id === selectedRideId,
      );
      pendingRideIdRef.current = initialRide ? null : (selectedRideId ?? null);
      setSelectedRide(initialRide ?? null);
      setWaitTime(
        log?.waitTimeMinutes === null || log?.waitTimeMinutes === undefined
          ? ''
          : String(log.waitTimeMinutes),
      );
      setLightningLaneUsed(log?.lightningLaneUsed ?? false);
      setRating(log?.rating ?? null);
      setNotes(log?.notes ?? '');
      setPhotos(log ? getRideLogPhotos(log).slice(0, MAX_PHOTOS) : []);
      setVisitedAt(log ? new Date(log.visitedAt) : new Date());
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
      setPhotos,
      setQuery,
      setRating,
      setSelectedRide,
      setTabBarHidden,
      setWaitTime,
      setVisitedAt,
      setDateTimePickerVisible,
      rideId,
      logId,
    ]),
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const ridesWithSearchText = rides
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

  const confirmDeleteRideLog = () => {
    if (!existingLog) return;

    Alert.alert('Delete ride log?', 'This entry will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeRideLog(existingLog.id);
          closePanel('/diary');
        },
      },
    ]);
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

  const recordRecentSearch = () => addRecentRideSearch(query);

  const chooseRide = (ride: Ride) => {
    pendingRideIdRef.current = null;
    recordRecentSearch();
    scrollY.setValue(0);
    setSelectedRide(ride);
    setWaitTime('');
    setLightningLaneUsed(false);
    setRating(null);
    setNotes('');
    setPhotos([]);
  };

  const addPhotos = async () => {
    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots === 0) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ['images'],
        selectionLimit: remainingSlots,
      });
      if (result.canceled) return;

      const acceptedPhotos: string[] = [];
      let oversizedCount = 0;
      let unverifiedCount = 0;
      result.assets.forEach((asset) => {
        if (asset.fileSize === undefined) {
          unverifiedCount += 1;
        } else if (asset.fileSize > MAX_PHOTO_SIZE_BYTES) {
          oversizedCount += 1;
        } else {
          acceptedPhotos.push(asset.uri);
        }
      });

      if (acceptedPhotos.length > 0) {
        setPhotos((currentPhotos) =>
          [...currentPhotos, ...acceptedPhotos].slice(0, MAX_PHOTOS),
        );
      }
      if (oversizedCount > 0 || unverifiedCount > 0) {
        const reasons = [
          oversizedCount > 0 &&
            `${oversizedCount} image${oversizedCount === 1 ? '' : 's'} exceeded 20 MB`,
          unverifiedCount > 0 &&
            `${unverifiedCount} image${unverifiedCount === 1 ? '' : 's'} could not be checked`,
        ].filter(Boolean);
        Alert.alert('Some photos were skipped', `${reasons.join(' and ')}.`);
      }
    } catch {
      Alert.alert(
        'Unable to add photos',
        'Please try selecting the images again.',
      );
    }
  };

  const saveRideLog = () => {
    if (!selectedRide) return;
    const now = new Date().toISOString();
    const parsedWaitTime = Number.parseInt(waitTime, 10);

    const rideLog = {
      id: existingLog?.id ?? `${selectedRide.id}-${Date.now()}`,
      rideId: selectedRide.id,
      tripId: existingLog?.tripId ?? null,
      visitedAt: visitedAt.toISOString(),
      waitTimeMinutes:
        Number.isFinite(parsedWaitTime) && parsedWaitTime >= 0
          ? parsedWaitTime
          : null,
      lightningLaneUsed: selectedRide.lightningLane && lightningLaneUsed,
      notes: notes.trim(),
      photos: photos.slice(0, MAX_PHOTOS),
      photoUrl: null,
      rating,
      createdAt: existingLog?.createdAt ?? now,
      updatedAt: now,
    };
    if (logId) {
      if (existingLog) updateRideLog(rideLog);
    } else {
      addRideLog(rideLog);
    }
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
        <Animated.View
          style={[
            styles.header,
            rideBackground && styles.headerOverlay,
            { height: 56 + insets.top, paddingTop: insets.top },
          ]}
        >
          {rideBackground && (
            <Animated.View
              pointerEvents='none'
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.background,
                  opacity: headerBackgroundOpacity,
                },
              ]}
            />
          )}
          <Pressable
            accessibilityLabel='Close ride form'
            accessibilityRole='button'
            hitSlop={8}
            onPress={() => closePanel(previousTabPath)}
            style={styles.headerAction}
          >
            {rideBackground ? (
              <>
                <Animated.View
                  pointerEvents='none'
                  style={[
                    styles.headerForeground,
                    { opacity: headerForegroundOpacity },
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: 'xmark.circle.fill',
                      android: 'cancel',
                      web: 'cancel',
                    }}
                    size={24}
                    tintColor='#ffffff'
                  />
                </Animated.View>
                <Animated.View style={{ opacity: headerBackgroundOpacity }}>
                  <SymbolView
                    name={{
                      ios: 'xmark.circle.fill',
                      android: 'cancel',
                      web: 'cancel',
                    }}
                    size={24}
                    tintColor={colors.accent}
                  />
                </Animated.View>
              </>
            ) : (
              <SymbolView
                name={{
                  ios: 'xmark.circle.fill',
                  android: 'cancel',
                  web: 'cancel',
                }}
                size={24}
                tintColor={colors.accent}
              />
            )}
          </Pressable>
          {rideBackground ? (
            <Animated.Text
              numberOfLines={1}
              pointerEvents='none'
              style={[
                styles.collapsingHeaderTitle,
                {
                  color: '#263d5a',
                  opacity: headerTitleOpacity,
                  top: insets.top + 16,
                },
              ]}
            >
              Log a Ride
            </Animated.Text>
          ) : (
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {logId ? 'Edit Ride' : 'Log a Ride'}
            </Text>
          )}
          {logId ? (
            <Pressable
              accessibilityLabel='Delete ride log'
              accessibilityRole='button'
              hitSlop={8}
              onPress={confirmDeleteRideLog}
              style={[styles.headerAction, styles.headerActionRight]}
            >
              {rideBackground ? (
                <>
                  <Animated.View
                    style={[
                      styles.headerDeleteForeground,
                      { opacity: headerForegroundOpacity },
                    ]}
                  >
                    <SymbolView
                      name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                      size={20}
                      tintColor='#ffffff'
                    />
                  </Animated.View>
                  <Animated.View style={{ opacity: headerBackgroundOpacity }}>
                    <SymbolView
                      name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                      size={20}
                      tintColor='#d92d20'
                    />
                  </Animated.View>
                </>
              ) : (
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={20}
                  tintColor='#d92d20'
                />
              )}
            </Pressable>
          ) : (
            <View style={styles.headerAction} />
          )}
        </Animated.View>

        {selectedRide ? (
          <Animated.ScrollView
            contentContainerStyle={[
              styles.formContent,
              { paddingBottom: insets.bottom + 36 },
            ]}
            keyboardShouldPersistTaps='handled'
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={styles.formScroll}
          >
            {rideBackground ? (
              <>
                <View style={{ height: insets.top }} />
                <Image
                  contentFit='cover'
                  source={rideBackground}
                  style={styles.formHeroImage}
                />
              </>
            ) : null}
            {!logId && (
              <Pressable
                accessibilityRole='button'
                onPress={() => {
                  pendingRideIdRef.current = null;
                  setSelectedRide(null);
                }}
                style={styles.changeRideButton}
              >
                <Text style={[styles.changeRideText, { color: colors.accent }]}>
                  Choose a different ride
                </Text>
              </Pressable>
            )}
            <Animated.View
              style={{ opacity: rideBackground ? largeTitleOpacity : 1 }}
            >
              <Text style={[styles.rideTitle, { color: '#263d5a' }]}>
                {selectedRide.name}
              </Text>
              <Text
                style={[styles.rideSubtitle, { color: colors.textSecondary }]}
              >
                {ParkLabels[selectedRide.park]} ·{' '}
                {LandLabels[selectedRide.land]}
              </Text>
            </Animated.View>

            <View style={styles.dateTimeRow}>
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

              {selectedRide.lightningLane && (
                <Pressable
                  accessibilityLabel='Lightning Lane used'
                  accessibilityRole='radio'
                  accessibilityState={{ selected: lightningLaneUsed }}
                  onPress={() => setLightningLaneUsed((used) => !used)}
                  style={({ pressed }) => [
                    styles.lightningLaneButton,
                    {
                      backgroundColor: lightningLaneUsed
                        ? colors.accent
                        : colors.background,
                      borderColor: colors.accent,
                    },
                    pressed && styles.lightningLaneButtonPressed,
                  ]}
                >
                  <SymbolView
                    name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
                    size={20}
                    tintColor={lightningLaneUsed ? '#ffffff' : colors.accent}
                  />
                </Pressable>
              )}
            </View>

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

            <View style={styles.photoHeader}>
              <Text style={[styles.photoLabel, { color: colors.text }]}>
                Photos ({photos.length}/{MAX_PHOTOS})
              </Text>
              {photos.length < MAX_PHOTOS && (
                <Pressable
                  accessibilityLabel='Add photos'
                  accessibilityRole='button'
                  onPress={addPhotos}
                  style={({ pressed }) => [
                    styles.addPhotosButton,
                    {
                      borderColor: colors.accent,
                    },
                    pressed && styles.addPhotosButtonPressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: 'camera',
                      android: 'photo_camera',
                      web: 'photo_camera',
                    }}
                    size={32}
                    tintColor={colors.accent}
                  />
                </Pressable>
              )}
            </View>
            <RideLogPhotos
              onRemove={(index) =>
                setPhotos((currentPhotos) =>
                  currentPhotos.filter((_, photoIndex) => photoIndex !== index),
                )
              }
              photos={photos}
              style={styles.formPhotoStrip}
            />

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
          </Animated.ScrollView>
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
                onSubmitEditing={recordRecentSearch}
                placeholder='Search by ride name, park or land.'
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
              ListHeaderComponent={
                !normalizedQuery && recentRideSearches.length > 0 ? (
                  <View style={styles.recentSearches}>
                    <Text
                      style={[
                        styles.recentSearchesLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Recent searches
                    </Text>
                    {recentRideSearches.map((search) => (
                      <Pressable
                        accessibilityRole='button'
                        key={search}
                        onPress={() => setQuery(search)}
                        style={styles.recentSearchItem}
                      >
                        <SymbolView
                          name={{
                            ios: 'clock.arrow.circlepath',
                            android: 'history',
                            web: 'history',
                          }}
                          size={16}
                          tintColor={colors.textSecondary}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.recentSearchText,
                            { color: colors.text },
                          ]}
                        >
                          {search}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null
              }
              ListEmptyComponent={
                isLoading ? (
                  <ActivityIndicator
                    color={colors.accent}
                    style={{ marginTop: 24 }}
                  />
                ) : hasError && rides.length === 0 ? (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    Ride catalog unavailable. Check your connection and Supabase
                    configuration.
                  </Text>
                ) : normalizedQuery || recentRideSearches.length === 0 ? (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    {normalizedQuery
                      ? 'No rides match your search.'
                      : 'Search by ride name, park, type, warning, or land.'}
                  </Text>
                ) : null
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
  headerOverlay: {
    borderBottomWidth: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  headerAction: {
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    position: 'relative',
  },
  headerActionRight: {
    alignItems: 'flex-end',
  },
  headerForeground: {
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  headerDeleteForeground: {
    alignItems: 'flex-end',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
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
  collapsingHeaderTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: '800',
    left: 84,
    lineHeight: 24,
    position: 'absolute',
    right: 84,
    textAlign: 'center',
  },
  formScroll: {
    flex: 1,
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
  recentSearches: {
    paddingTop: 20,
  },
  recentSearchesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  recentSearchItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 44,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 15,
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
  formHeroImage: {
    height: 220,
    marginHorizontal: -24,
    width: Dimensions.get('window').width,
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
  dateTimeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    minHeight: 44,
  },
  dateTimeButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  lightningLaneButton: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  lightningLaneButtonPressed: {
    opacity: 0.72,
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
  photoHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    minHeight: 56,
  },
  photoLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 0,
    marginTop: 0,
  },
  addPhotosButton: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1.5,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  addPhotosButtonPressed: {
    opacity: 0.72,
  },
  formPhotoStrip: {
    marginTop: 12,
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
