import { useFocusEffect } from 'expo-router';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Keyboard } from 'react-native';

import { MAX_RIDE_LOG_PHOTOS } from '@/data/ride-log-photo-picker';
import { Ride } from '@/models/ride';
import { getRideLogPhotos, RideLog } from '@/models/ride-log';

type RideLogFormStateOptions = {
  logId?: string;
  panelOffset: number;
  panelPosition: Animated.Value;
  rideId?: string;
  rideLogs: RideLog[];
  rides: Ride[];
  setTabBarHidden: Dispatch<SetStateAction<boolean>>;
};

export function useRideLogFormState({
  logId,
  panelOffset,
  panelPosition,
  rideId,
  rideLogs,
  rides,
  setTabBarHidden,
}: RideLogFormStateOptions) {
  const rideLogsRef = useRef(rideLogs);
  const ridesRef = useRef(rides);
  const pendingRideIdRef = useRef<string | null>(null);
  const [scrollY] = useState(() => new Animated.Value(0));
  const [query, setQuery] = useState('');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [waitTime, setWaitTime] = useState('');
  const [waitTimeManuallyChanged, setWaitTimeManuallyChanged] = useState(false);
  const [waitTimerStartedAt, setWaitTimerStartedAt] = useState<number | null>(
    null,
  );
  const [waitTimerElapsedSeconds, setWaitTimerElapsedSeconds] = useState(0);
  const [lightningLaneUsed, setLightningLaneUsed] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [videoAssetId, setVideoAssetId] = useState<string | null>(null);
  const [visitedAt, setVisitedAt] = useState(() => new Date());
  const [draftVisitedAt, setDraftVisitedAt] = useState(() => new Date());
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);

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

  useEffect(() => {
    if (waitTimerStartedAt === null) return;

    const updateElapsedTime = () =>
      setWaitTimerElapsedSeconds(
        Math.floor((Date.now() - waitTimerStartedAt) / 1000),
      );
    updateElapsedTime();
    const intervalId = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(intervalId);
  }, [waitTimerStartedAt]);

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
      setWaitTimeManuallyChanged(false);
      setWaitTimerStartedAt(null);
      setWaitTimerElapsedSeconds(0);
      setLightningLaneUsed(log?.lightningLaneUsed ?? false);
      setRating(log?.rating ?? null);
      setNotes(log?.notes ?? '');
      setPhotos(log ? getRideLogPhotos(log).slice(0, MAX_RIDE_LOG_PHOTOS) : []);
      setPhotoPaths(log?.photoPaths?.slice(0, MAX_RIDE_LOG_PHOTOS) ?? []);
      setVideoAssetId(log?.videoAssetId ?? null);
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
    }, [panelPosition, panelOffset, setTabBarHidden, rideId, logId]),
  );

  return {
    clearPendingRideId: () => {
      pendingRideIdRef.current = null;
    },
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
    setVideoAssetId,
    setWaitTime,
    onChangeWaitTime: (value: string) => {
      setWaitTime(value);
      setWaitTimeManuallyChanged(value.trim().length > 0);
    },
    startWaitTimer: () => {
      setWaitTimerElapsedSeconds(0);
      setWaitTimerStartedAt(Date.now());
    },
    stopWaitTimer: () => {
      if (waitTimerStartedAt === null) return;
      const stoppedAt = new Date();
      const elapsedSeconds = Math.floor(
        (stoppedAt.getTime() - waitTimerStartedAt) / 1000,
      );
      setWaitTime(String(Math.round(elapsedSeconds / 60)));
      setWaitTimeManuallyChanged(false);
      setVisitedAt(stoppedAt);
      setWaitTimerElapsedSeconds(elapsedSeconds);
      setWaitTimerStartedAt(null);
    },
    resetWaitTimer: () => {
      setWaitTimerStartedAt(null);
      setWaitTimerElapsedSeconds(0);
      setWaitTimeManuallyChanged(false);
    },
    visitedAt,
    videoAssetId,
    waitTime,
    waitTimeManuallyChanged,
    waitTimerElapsedSeconds,
    waitTimerStartedAt,
  };
}
