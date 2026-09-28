import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Animated, Dimensions } from 'react-native';

import { useAppState } from '@/components/app-state';
import { useRideCatalog } from '@/components/ride-catalog-provider';
import { useRidePreferences } from '@/components/ride-preferences-provider';
import { useRideTrips } from '@/components/ride-trips-provider';
import {
  MAX_RIDE_LOG_PHOTOS,
  pickRideLogPhotos,
} from '@/data/ride-log-photo-picker';
import { searchRideCatalog } from '@/data/ride-log-search';
import { pickRideLogVideo } from '@/data/ride-log-video-picker';
import { deleteCachedRideLogPhotos } from '@/data/ride-logs';
import { useRideLogFormState } from '@/hooks/use-ride-log-form-state';
import { Ride } from '@/models/ride';
import { RideLog } from '@/models/ride-log';
import { getRideTripForDate } from '@/models/ride-trip';

export function useRideLogController() {
  const {
    rideId: rideIdParam,
    logId: logIdParam,
    returnTo: returnToParam,
  } = useLocalSearchParams<{
    rideId?: string | string[];
    logId?: string | string[];
    returnTo?: string | string[];
  }>();
  const rideId = Array.isArray(rideIdParam) ? rideIdParam[0] : rideIdParam;
  const logId = Array.isArray(logIdParam) ? logIdParam[0] : logIdParam;
  const returnTo = Array.isArray(returnToParam)
    ? returnToParam[0]
    : returnToParam;
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
    rideLogsReady,
    rideLogs,
    recentRideSearches,
    setTabBarHidden,
  } = useAppState();
  const { rides, isLoading, hasError } = useRideCatalog();
  const { setRideRating } = useRidePreferences();
  const { trips, isLoading: tripsLoading } = useRideTrips();
  const existingLog = rideLogs.find((log) => log.id === logId);
  const [panelPosition] = useState(() => new Animated.Value(panelOffset));
  const draft = useRideLogFormState({
    logId,
    panelOffset,
    panelPosition,
    rideId,
    rideLogs,
    rides,
    setTabBarHidden,
  });
  const {
    clearPendingRideId,
    discardRideLogDraft,
    dateTimePickerVisible,
    draftVisitedAt,
    lightningLaneUsed,
    notes,
    photos,
    photoPaths,
    videoAssetId,
    query,
    rating,
    scrollY,
    selectedRide,
    setDateTimePickerVisible,
    setDraftVisitedAt,
    setLightningLaneUsed,
    setNotes,
    setPhotos,
    setPhotoPaths,
    setVideoAssetId,
    setQuery,
    setRating,
    setSelectedRide,
    setTripIdOverride,
    setVisitedAt,
    setWaitTime,
    onChangeWaitTime,
    resetWaitTimer,
    startWaitTimer,
    stopWaitTimer,
    visitedAt,
    waitTime,
    waitTimeManuallyChanged,
    waitTimerElapsedSeconds,
    waitTimerStartedAt,
    tripIdOverride,
  } = draft;
  const tripId =
    tripIdOverride !== undefined
      ? tripIdOverride
      : existingLog
        ? existingLog.tripId
        : (getRideTripForDate(trips, visitedAt)?.id ?? null);
  const [isMutating, setIsMutating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const filteredRides = searchRideCatalog(rides, query);

  const animatePanelOut = (onClose: () => void) => {
    Animated.timing(panelPosition, {
      toValue: panelOffset,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const closePanel = (destination: string) => {
    animatePanelOut(() => router.replace(destination as Href));
  };

  const closeRideForm = () => {
    resetWaitTimer();
    if (!logId && !rideId) {
      if (selectedRide) {
        setSelectedRide(null);
      } else {
        discardRideLogDraft();
        closePanel(previousTabPath);
      }
      return;
    }

    if (!logId) discardRideLogDraft();
    animatePanelOut(() => {
      if (returnTo) {
        router.replace(returnTo as Href);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(previousTabPath as Href);
      }
    });
  };

  const deleteExistingRideLog = async () => {
    if (!existingLog || isMutating) return;

    setIsMutating(true);
    setIsDeleting(true);
    try {
      await removeRideLog(existingLog.id);
      closePanel('/diary');
    } catch (error) {
      Alert.alert(
        'Unable to delete ride log',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsMutating(false);
      setIsDeleting(false);
    }
  };

  const confirmDeleteRideLog = () => {
    if (!existingLog) return;

    Alert.alert('Delete ride log?', 'This entry will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void deleteExistingRideLog(),
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
    resetWaitTimer();
    clearPendingRideId();
    recordRecentSearch();
    scrollY.setValue(0);
    setSelectedRide(ride);
    setWaitTime('');
    setLightningLaneUsed(false);
    setRating(null);
    setNotes('');
    setPhotos([]);
    setPhotoPaths([]);
    setVideoAssetId(null);
  };

  const removePhoto = (index: number) => {
    if (isMutating) return;
    const photo = photos[index];
    if (photo) deleteCachedRideLogPhotos([photo]);
    setPhotos((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
    setPhotoPaths((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const addPhotos = async () => {
    if (isMutating) return;
    const remainingSlots = MAX_RIDE_LOG_PHOTOS - photos.length;
    if (remainingSlots === 0) return;

    try {
      const result = await pickRideLogPhotos(remainingSlots);
      if (!result) return;
      if (result.photos.length > 0) {
        setPhotos((current) =>
          [...current, ...result.photos].slice(0, MAX_RIDE_LOG_PHOTOS),
        );
        setPhotoPaths((current) =>
          [...current, ...result.photos.map(() => '')].slice(
            0,
            MAX_RIDE_LOG_PHOTOS,
          ),
        );
      }
      if (
        result.oversizedCount +
          result.unverifiedCount +
          result.unavailableCount >
        0
      ) {
        const reasons = [
          result.oversizedCount > 0 &&
            `${result.oversizedCount} image${result.oversizedCount === 1 ? '' : 's'} exceeded 20 MB`,
          result.unverifiedCount > 0 &&
            `${result.unverifiedCount} image${result.unverifiedCount === 1 ? '' : 's'} could not be checked`,
          result.unavailableCount > 0 &&
            `${result.unavailableCount} image${result.unavailableCount === 1 ? '' : 's'} could not be copied for upload`,
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

  const addVideo = async () => {
    if (isMutating) return;
    try {
      const assetId = await pickRideLogVideo();
      if (assetId) setVideoAssetId(assetId);
    } catch (error) {
      Alert.alert(
        'Unable to add video',
        error instanceof Error
          ? error.message
          : 'Please try selecting it again.',
      );
    }
  };

  const removeVideo = () => setVideoAssetId(null);

  const saveCurrentRideLog = async () => {
    if (!selectedRide || isMutating) return;
    const savedAt = new Date();
    const waitTimeToSave =
      waitTimerStartedAt !== null && !waitTimeManuallyChanged
        ? String(Math.round((savedAt.getTime() - waitTimerStartedAt) / 60000))
        : waitTime;
    const visitedAtToSave = waitTimerStartedAt === null ? visitedAt : savedAt;
    if (waitTimerStartedAt !== null) {
      setWaitTime(waitTimeToSave);
      setVisitedAt(savedAt);
      resetWaitTimer();
    }
    setIsMutating(true);
    try {
      const now = savedAt.toISOString();
      const parsedWaitTime = Number.parseInt(waitTimeToSave, 10);
      const rideLog: RideLog = {
        id: existingLog?.id ?? `${selectedRide.id}-${Date.now()}`,
        rideId: selectedRide.id,
        tripId:
          tripIdOverride !== undefined
            ? tripIdOverride
            : existingLog
              ? existingLog.tripId
              : (getRideTripForDate(trips, visitedAtToSave)?.id ?? null),
        visitedAt: visitedAtToSave.toISOString(),
        waitTimeMinutes:
          Number.isFinite(parsedWaitTime) && parsedWaitTime >= 0
            ? parsedWaitTime
            : null,
        lightningLaneUsed: selectedRide.lightningLane && lightningLaneUsed,
        notes: notes.trim(),
        photos: photos.slice(0, MAX_RIDE_LOG_PHOTOS),
        photoPaths: photoPaths.slice(0, MAX_RIDE_LOG_PHOTOS),
        videoAssetId,
        photoUrl: null,
        rating,
        createdAt: existingLog?.createdAt ?? now,
        updatedAt: now,
      };
      if (logId) {
        if (existingLog) await updateRideLog(rideLog);
      } else {
        await addRideLog(rideLog);
      }
      if ((!logId || existingLog) && rating !== null) {
        setRideRating(selectedRide.id, rating);
      }
      if (!logId) discardRideLogDraft();
      closePanel('/diary');
    } catch (error) {
      Alert.alert(
        'Unable to save ride log',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsMutating(false);
    }
  };

  return {
    addVideo,
    addPhotos,
    chooseRide,
    clearPendingRideId,
    closeDateTimePicker,
    closePanel,
    closeRideForm,
    confirmDeleteRideLog,
    dateTimePickerVisible,
    draftVisitedAt,
    filteredRides,
    hasError,
    isDeleting,
    isLoading,
    isMutating,
    logId,
    notes,
    openDateTimePicker,
    panelOffset,
    panelPosition,
    photos,
    previousTabPath,
    query,
    rating,
    recentRideSearches,
    recordRecentSearch,
    removePhoto,
    removeVideo,
    rideLogsReady: rideLogsReady && !tripsLoading,
    rides,
    saveCurrentRideLog,
    saveDateTimePicker,
    scrollY,
    selectedRide,
    resetWaitTimer,
    startWaitTimer,
    stopWaitTimer,
    setDraftVisitedAt,
    setLightningLaneUsed,
    setNotes,
    setQuery,
    setRating,
    setSelectedRide,
    setTripId: (value: string | null) => setTripIdOverride(value),
    setWaitTime: onChangeWaitTime,
    slideFromRight,
    visitedAt,
    videoAssetId,
    waitTime,
    waitTimerElapsedSeconds,
    waitTimerStartedAt,
    lightningLaneUsed,
    tripId,
  };
}
