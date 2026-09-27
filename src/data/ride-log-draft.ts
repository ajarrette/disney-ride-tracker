import Storage from 'expo-sqlite/kv-store';

const RIDE_LOG_DRAFT_STORAGE_KEY = 'ride-log-draft:v1';
export const LEGACY_WAIT_TIMER_STORAGE_KEY = 'ride-wait-timer:v1';

export type RideLogDraft = {
  rideId: string | null;
  query: string;
  waitTime: string;
  waitTimeManuallyChanged: boolean;
  waitTimerStartedAt: number | null;
  lightningLaneUsed: boolean;
  rating: number | null;
  notes: string;
  photos: string[];
  photoPaths: string[];
  videoAssetId: string | null;
  visitedAt: string;
};

export type PersistedWaitTimer = {
  rideId: string;
  startedAt: number;
};

const removeStoredValue = (key: string) => {
  try {
    Storage.removeItemSync(key);
  } catch {}
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isRideLogDraft = (value: unknown): value is RideLogDraft => {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    (draft.rideId === null || typeof draft.rideId === 'string') &&
    typeof draft.query === 'string' &&
    typeof draft.waitTime === 'string' &&
    typeof draft.waitTimeManuallyChanged === 'boolean' &&
    (draft.waitTimerStartedAt === null ||
      (typeof draft.waitTimerStartedAt === 'number' &&
        Number.isFinite(draft.waitTimerStartedAt) &&
        draft.waitTimerStartedAt > 0)) &&
    (draft.rideId !== null || draft.waitTimerStartedAt === null) &&
    typeof draft.lightningLaneUsed === 'boolean' &&
    (draft.rating === null ||
      (typeof draft.rating === 'number' && Number.isFinite(draft.rating))) &&
    typeof draft.notes === 'string' &&
    isStringArray(draft.photos) &&
    isStringArray(draft.photoPaths) &&
    (draft.videoAssetId === null || typeof draft.videoAssetId === 'string') &&
    typeof draft.visitedAt === 'string' &&
    Number.isFinite(Date.parse(draft.visitedAt))
  );
};

const isPersistedWaitTimer = (value: unknown): value is PersistedWaitTimer => {
  if (typeof value !== 'object' || value === null) return false;
  const timer = value as Record<string, unknown>;
  return (
    typeof timer.rideId === 'string' &&
    typeof timer.startedAt === 'number' &&
    Number.isFinite(timer.startedAt) &&
    timer.startedAt > 0
  );
};

export const readRideLogDraft = (): RideLogDraft | null => {
  try {
    const value = Storage.getItemSync(RIDE_LOG_DRAFT_STORAGE_KEY);
    if (!value) return null;
    const draft: unknown = JSON.parse(value);
    if (isRideLogDraft(draft)) return draft;
  } catch {}
  removeStoredValue(RIDE_LOG_DRAFT_STORAGE_KEY);
  return null;
};

export const writeRideLogDraft = (draft: RideLogDraft) => {
  try {
    Storage.setItemSync(RIDE_LOG_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {}
};

export const readPersistedWaitTimer = (): PersistedWaitTimer | null => {
  try {
    const value = Storage.getItemSync(LEGACY_WAIT_TIMER_STORAGE_KEY);
    if (!value) return null;
    const timer: unknown = JSON.parse(value);
    if (isPersistedWaitTimer(timer)) return timer;
  } catch {}
  removeStoredValue(LEGACY_WAIT_TIMER_STORAGE_KEY);
  return null;
};

export const writePersistedWaitTimer = (timer: PersistedWaitTimer) => {
  try {
    Storage.setItemSync(LEGACY_WAIT_TIMER_STORAGE_KEY, JSON.stringify(timer));
  } catch {}
};

export const clearPersistedWaitTimer = () =>
  removeStoredValue(LEGACY_WAIT_TIMER_STORAGE_KEY);

export const clearRideLogDraft = () => {
  removeStoredValue(RIDE_LOG_DRAFT_STORAGE_KEY);
  clearPersistedWaitTimer();
};

export const hasRideLogDraftToResume = () =>
  readRideLogDraft() !== null || readPersistedWaitTimer() !== null;
