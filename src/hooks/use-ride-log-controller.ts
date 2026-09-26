import { useState } from 'react';
import { Alert, Animated, Dimensions } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { useAppState } from '@/components/app-state';
import { useRideCatalog } from '@/components/ride-catalog-provider';
import { deleteCachedRideLogPhotos } from '@/data/ride-logs';
import {
  MAX_RIDE_LOG_PHOTOS,
  pickRideLogPhotos,
} from '@/data/ride-log-photo-picker';
import { searchRideCatalog } from '@/data/ride-log-search';
import { useRideLogFormState } from '@/hooks/use-ride-log-form-state';
import { Ride } from '@/models/ride';
import { RideLog } from '@/models/ride-log';

export function useRideLogController() {
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
    rideLogsReady,
    rideLogs,
    recentRideSearches,
    setTabBarHidden,
  } = useAppState();
  const { rides, isLoading, hasError } = useRideCatalog();
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
    dateTimePickerVisible,
    draftVisitedAt,
    lightningLaneUsed,
    notes,
    photos,
    photoPaths,
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
    setQuery,
    setRating,
    setSelectedRide,
    setVisitedAt,
    setWaitTime,
    visitedAt,
    waitTime,
  } = draft;
  const [isMutating, setIsMutating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const filteredRides = searchRideCatalog(rides, query);

  const closePanel = (destination: string) => {
    Animated.timing(panelPosition, {
      toValue: panelOffset,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.replace(destination as Href);
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

  const saveCurrentRideLog = async () => {
    if (!selectedRide || isMutating) return;
    setIsMutating(true);
    try {
      const now = new Date().toISOString();
      const parsedWaitTime = Number.parseInt(waitTime, 10);
      const rideLog: RideLog = {
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
        photos: photos.slice(0, MAX_RIDE_LOG_PHOTOS),
        photoPaths: photoPaths.slice(0, MAX_RIDE_LOG_PHOTOS),
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
    addPhotos,
    chooseRide,
    clearPendingRideId,
    closeDateTimePicker,
    closePanel,
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
    rideLogsReady,
    rides,
    saveCurrentRideLog,
    saveDateTimePicker,
    scrollY,
    selectedRide,
    setDraftVisitedAt,
    setLightningLaneUsed,
    setNotes,
    setQuery,
    setRating,
    setSelectedRide,
    setWaitTime,
    slideFromRight,
    visitedAt,
    waitTime,
    lightningLaneUsed,
  };
}
