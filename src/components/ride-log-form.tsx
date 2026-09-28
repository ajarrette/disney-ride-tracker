import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideFavoriteMark } from '@/components/ride-favorite-mark';
import { rideLogFormStyles as styles } from '@/components/ride-log-form.styles';
import { RideLogPhotos } from '@/components/ride-log-photos';
import { RideLogRating } from '@/components/ride-log-rating';
import { RideLogVideo } from '@/components/ride-log-video';
import { useRidePreferences } from '@/components/ride-preferences-provider';
import { RideTripSelector } from '@/components/ride-trip-selector';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { getRideBackground } from '@/data/ride-images';
import { MAX_RIDE_LOG_PHOTOS } from '@/data/ride-log-photo-picker';
import { Ride } from '@/models/ride';

export type RideLogFormValue = {
  lightningLaneUsed: boolean;
  notes: string;
  photos: string[];
  rating: number | null;
  tripId: string | null;
  visitedAt: Date;
  videoAssetId: string | null;
  waitTime: string;
  waitTimerElapsedSeconds: number;
  waitTimerStartedAt: number | null;
};

export type RideLogFormActions = {
  onAddPhotos: () => void;
  onAddVideo: () => void;
  onChangeNotes: (notes: string) => void;
  onChangeRating: (rating: number) => void;
  onChangeTrip: (tripId: string | null) => void;
  onChangeWaitTime: (waitTime: string) => void;
  onChooseDifferentRide: () => void;
  onOpenDateTimePicker: () => void;
  onRemovePhoto: (index: number) => void;
  onRemoveVideo: () => void;
  onSave: () => void;
  onStartWaitTimer: () => void;
  onStopWaitTimer: () => void;
  onToggleLightningLane: () => void;
};

type RideLogFormProps = {
  actions: RideLogFormActions;
  draft: RideLogFormValue;
  isEditing: boolean;
  isMutating: boolean;
  ride: Ride;
  rideLogsReady: boolean;
  scrollY: Animated.Value;
  topInset: number;
};

const formatVisitedAt = (value: Date) =>
  `${value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${value.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

const formatWaitTimer = (elapsedSeconds: number) => {
  const seconds = elapsedSeconds % 60;
  const totalMinutes = Math.floor(elapsedSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function RideLogForm({
  actions,
  draft,
  isEditing,
  isMutating,
  ride,
  rideLogsReady,
  scrollY,
  topInset,
}: RideLogFormProps) {
  const colors = Colors.light;
  const { favoriteRideIds, setRideFavorite } = useRidePreferences();
  const insets = useSafeAreaInsets();
  const rideBackground = getRideBackground(ride.park, ride.backgroundUrl);
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [140, 220],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.ScrollView
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={styles.formContent}
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
            <View style={{ height: topInset }} />
            <Image
              contentFit='cover'
              source={rideBackground}
              style={styles.formHeroImage}
            />
          </>
        ) : null}
        {!isEditing && (
          <Pressable
            accessibilityRole='button'
            onPress={actions.onChooseDifferentRide}
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
            {ride.name}
            <RideFavoriteMark
              accessibilityLabel={
                favoriteRideIds.has(ride.id)
                  ? `Remove ${ride.name} from favorites`
                  : `Add ${ride.name} to favorites`
              }
              isFavorite={favoriteRideIds.has(ride.id)}
              onToggle={(isFavorite) => setRideFavorite(ride.id, isFavorite)}
            />
          </Text>
          <Text style={[styles.rideSubtitle, { color: colors.textSecondary }]}>
            {ParkLabels[ride.park]} · {LandLabels[ride.land]}
          </Text>
        </Animated.View>

        <View style={styles.dateTimeRow}>
          <Pressable
            accessibilityLabel={`Change ride date and time, ${formatVisitedAt(draft.visitedAt)}`}
            accessibilityRole='button'
            onPress={actions.onOpenDateTimePicker}
            style={styles.dateTimeButton}
          >
            <Text style={[styles.dateTimeValue, { color: colors.accent }]}>
              {formatVisitedAt(draft.visitedAt)}
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

          {ride.lightningLane && (
            <Pressable
              accessibilityLabel='Lightning Lane used'
              accessibilityRole='radio'
              accessibilityState={{ selected: draft.lightningLaneUsed }}
              onPress={actions.onToggleLightningLane}
              style={({ pressed }) => [
                styles.lightningLaneButton,
                {
                  backgroundColor: draft.lightningLaneUsed
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
                tintColor={draft.lightningLaneUsed ? '#ffffff' : colors.accent}
              />
            </Pressable>
          )}
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Wait time (minutes)
        </Text>
        {isEditing ? (
          <TextInput
            accessibilityLabel='Wait time in minutes'
            keyboardType='number-pad'
            onChangeText={actions.onChangeWaitTime}
            placeholder='Optional'
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.textInput,
              { borderColor: '#dce7f2', color: colors.text },
            ]}
            value={draft.waitTime}
          />
        ) : (
          <View style={styles.waitTimeRow}>
            <TextInput
              accessibilityLabel='Wait time in minutes'
              keyboardType='number-pad'
              onChangeText={actions.onChangeWaitTime}
              placeholder='Minutes'
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                styles.waitTimeInput,
                { borderColor: '#dce7f2', color: colors.text },
              ]}
              value={draft.waitTime}
            />
            <View style={styles.waitTimerControls}>
              {draft.waitTimerStartedAt === null ? (
                <Pressable
                  accessibilityLabel='Start wait timer'
                  accessibilityRole='button'
                  onPress={actions.onStartWaitTimer}
                  style={({ pressed }) => [
                    styles.waitTimerButton,
                    styles.waitTimerStartButton,
                    { borderColor: colors.accent },
                    pressed && styles.waitTimerButtonPressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: 'play.fill',
                      android: 'play_arrow',
                      web: 'play_arrow',
                    }}
                    size={16}
                    tintColor={colors.accent}
                  />
                  <Text
                    style={[
                      styles.waitTimerStartText,
                      { color: colors.accent },
                    ]}
                  >
                    Start
                  </Text>
                </Pressable>
              ) : (
                <>
                  <Text
                    accessibilityLabel={`Elapsed wait time ${formatWaitTimer(draft.waitTimerElapsedSeconds)}`}
                    style={[styles.waitTimerValue, { color: colors.text }]}
                  >
                    {formatWaitTimer(draft.waitTimerElapsedSeconds)}
                  </Text>
                  <Pressable
                    accessibilityLabel='Stop wait timer'
                    accessibilityRole='button'
                    onPress={actions.onStopWaitTimer}
                    style={({ pressed }) => [
                      styles.waitTimerButton,
                      styles.waitTimerStopButton,
                      pressed && styles.waitTimerButtonPressed,
                    ]}
                  >
                    <SymbolView
                      name={{ ios: 'stop.fill', android: 'stop', web: 'stop' }}
                      size={14}
                      tintColor='#ffffff'
                    />
                    <Text style={styles.waitTimerStopText}>Stop</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Rating</Text>
        <RideLogRating
          onChange={actions.onChangeRating}
          rating={draft.rating}
        />

        <View style={styles.photoHeader}>
          <Text style={[styles.photoLabel, { color: colors.text }]}>
            Photos ({draft.photos.length}/{MAX_RIDE_LOG_PHOTOS})
          </Text>
          {draft.photos.length < MAX_RIDE_LOG_PHOTOS && (
            <Pressable
              accessibilityLabel='Add photos'
              accessibilityRole='button'
              disabled={isMutating}
              onPress={actions.onAddPhotos}
              style={({ pressed }) => [
                styles.addPhotosButton,
                { borderColor: colors.accent },
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
          onRemove={isMutating ? undefined : actions.onRemovePhoto}
          photos={draft.photos}
          style={styles.formPhotoStrip}
        />

        <View style={styles.photoHeader}>
          <Text style={[styles.photoLabel, { color: colors.text }]}>Video</Text>
          <Pressable
            accessibilityLabel={
              draft.videoAssetId ? 'Replace video' : 'Add video'
            }
            accessibilityRole='button'
            disabled={isMutating}
            onPress={actions.onAddVideo}
            style={({ pressed }) => [
              styles.addPhotosButton,
              { borderColor: colors.accent },
              pressed && styles.addPhotosButtonPressed,
            ]}
          >
            <SymbolView
              name={{
                ios: draft.videoAssetId
                  ? 'arrow.triangle.2.circlepath'
                  : 'video.badge.plus',
                android: draft.videoAssetId ? 'autorenew' : 'video_call',
                web: draft.videoAssetId ? 'autorenew' : 'video_call',
              }}
              size={28}
              tintColor={colors.accent}
            />
          </Pressable>
        </View>
        {draft.videoAssetId && (
          <RideLogVideo
            assetId={draft.videoAssetId}
            onRemove={isMutating ? undefined : actions.onRemoveVideo}
          />
        )}

        <RideTripSelector
          allowNone
          editable
          label='Trip'
          noneLabel='No trip'
          onSelect={actions.onChangeTrip}
          selectedTripId={draft.tripId}
          showFieldLabel
        />

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes</Text>
        <TextInput
          accessibilityLabel='Ride notes'
          multiline
          onChangeText={actions.onChangeNotes}
          placeholder='Add a note about this ride'
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.textInput,
            styles.notesInput,
            { borderColor: '#dce7f2', color: colors.text },
          ]}
          textAlignVertical='top'
          value={draft.notes}
        />
      </Animated.ScrollView>
      <View
        style={[
          styles.saveFooter,
          {
            backgroundColor: colors.background,
            borderTopColor: '#dce7f2',
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ disabled: isMutating || !rideLogsReady }}
          disabled={isMutating || !rideLogsReady}
          onPress={actions.onSave}
          style={({ pressed }) => [
            styles.saveButton,
            (isMutating || !rideLogsReady) && styles.saveButtonDisabled,
            pressed && styles.saveButtonPressed,
          ]}
        >
          {isMutating ? (
            <View style={styles.saveButtonContent}>
              <ActivityIndicator color='#ffffff' size='small' />
              <Text style={styles.saveButtonText}>Saving</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update' : 'Log Ride'}
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}
