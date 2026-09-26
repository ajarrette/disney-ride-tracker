import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideLogDateTimePicker } from '@/components/ride-log-date-time-picker';
import { RideLogForm } from '@/components/ride-log-form';
import { RideLogHeader } from '@/components/ride-log-header';
import { RideLogPicker } from '@/components/ride-log-picker';
import { Colors } from '@/constants/theme';
import { getRideBackground } from '@/data/ride-images';
import { useRideLogController } from '@/hooks/use-ride-log-controller';

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const controller = useRideLogController();
  const colors = Colors.light;
  const rideBackground = controller.selectedRide
    ? getRideBackground(
        controller.selectedRide.park,
        controller.selectedRide.backgroundUrl,
      )
    : null;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          backgroundColor: colors.background,
          transform: controller.slideFromRight
            ? [{ translateX: controller.panelPosition }]
            : [{ translateY: controller.panelPosition }],
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios' && !controller.selectedRide
            ? 'padding'
            : undefined
        }
        style={styles.content}
      >
        <RideLogHeader
          hasBackground={Boolean(rideBackground)}
          isDeleting={controller.isDeleting}
          isEditing={Boolean(controller.logId)}
          isMutating={controller.isMutating}
          onClose={() => controller.closePanel(controller.previousTabPath)}
          onDelete={controller.confirmDeleteRideLog}
          scrollY={controller.scrollY}
        />
        {controller.selectedRide ? (
          <RideLogForm
            actions={{
              onAddPhotos: () => void controller.addPhotos(),
              onChangeNotes: controller.setNotes,
              onChangeRating: controller.setRating,
              onChangeWaitTime: controller.setWaitTime,
              onChooseDifferentRide: () => {
                controller.clearPendingRideId();
                controller.setSelectedRide(null);
              },
              onOpenDateTimePicker: controller.openDateTimePicker,
              onRemovePhoto: controller.removePhoto,
              onSave: () => void controller.saveCurrentRideLog(),
              onToggleLightningLane: () =>
                controller.setLightningLaneUsed((used) => !used),
            }}
            draft={{
              lightningLaneUsed: controller.lightningLaneUsed,
              notes: controller.notes,
              photos: controller.photos,
              rating: controller.rating,
              visitedAt: controller.visitedAt,
              waitTime: controller.waitTime,
            }}
            isEditing={Boolean(controller.logId)}
            isMutating={controller.isMutating}
            ride={controller.selectedRide}
            rideLogsReady={controller.rideLogsReady}
            scrollY={controller.scrollY}
            topInset={insets.top}
          />
        ) : (
          <RideLogPicker
            filteredRides={controller.filteredRides}
            hasError={controller.hasError}
            isLoading={controller.isLoading}
            onChooseRide={controller.chooseRide}
            onQueryChange={controller.setQuery}
            onRecentSearch={controller.setQuery}
            onSubmitSearch={controller.recordRecentSearch}
            query={controller.query}
            recentRideSearches={controller.recentRideSearches}
            rideCount={controller.rides.length}
          />
        )}
      </KeyboardAvoidingView>
      <RideLogDateTimePicker
        bottomInset={insets.bottom}
        onChange={controller.setDraftVisitedAt}
        onClose={controller.closeDateTimePicker}
        onSave={controller.saveDateTimePicker}
        value={controller.draftVisitedAt}
        visible={controller.dateTimePickerVisible}
      />
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
});
