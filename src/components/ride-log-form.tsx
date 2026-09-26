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

import { RideLogPhotos } from '@/components/ride-log-photos';
import { RideLogRating } from '@/components/ride-log-rating';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { rideLogFormStyles as styles } from '@/components/ride-log-form.styles';
import { MAX_RIDE_LOG_PHOTOS } from '@/data/ride-log-photo-picker';
import { getRideBackground } from '@/data/ride-images';
import { Ride } from '@/models/ride';

export type RideLogFormValue = {
  lightningLaneUsed: boolean;
  notes: string;
  photos: string[];
  rating: number | null;
  visitedAt: Date;
  waitTime: string;
};

export type RideLogFormActions = {
  onAddPhotos: () => void;
  onChangeNotes: (notes: string) => void;
  onChangeRating: (rating: number) => void;
  onChangeWaitTime: (waitTime: string) => void;
  onChooseDifferentRide: () => void;
  onOpenDateTimePicker: () => void;
  onRemovePhoto: (index: number) => void;
  onSave: () => void;
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
            <Text style={styles.saveButtonText}>Save Ride</Text>
          )}
        </Pressable>
      </View>
    </>
  );
}
