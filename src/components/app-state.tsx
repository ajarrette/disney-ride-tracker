import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState as ReactNativeAppState } from 'react-native';
import Storage from 'expo-sqlite/kv-store';

import {
  deleteRideLog as deleteRemoteRideLog,
  deleteCachedRideLogPhotos,
  deleteRideLogPhotos,
  fetchRideLogs,
  saveRideLog as saveRemoteRideLog,
} from '@/data/ride-logs';
import { supabase } from '@/data/supabase';
import { RideLog } from '@/models/ride-log';

type RideLogSyncStatus = 'pending' | 'failed';
type RideLogOperation =
  | {
      mutationId: string;
      type: 'upsert';
      rideLog: RideLog;
      previousPhotoPaths: string[];
    }
  | {
      mutationId: string;
      type: 'delete';
      logId: string;
      photoPaths: string[];
      localPhotoUris: string[];
    };

type CachedRideLogs = {
  logs: RideLog[];
  operations: RideLogOperation[];
};

const CACHE_KEY_PREFIX = 'ride-logs:v1:';
const SYNC_INTERVAL_MS = 30_000;

const sortRideLogs = (logs: RideLog[]) =>
  [...logs].sort(
    (first, second) =>
      new Date(second.visitedAt).getTime() -
      new Date(first.visitedAt).getTime(),
  );

type AppState = {
  tabBarHidden: boolean;
  setTabBarHidden: Dispatch<SetStateAction<boolean>>;
  rideDetailsOpen: boolean;
  setRideDetailsOpen: Dispatch<SetStateAction<boolean>>;
  previousTabPath: string;
  setPreviousTabPath: Dispatch<SetStateAction<string>>;
  rideLogs: RideLog[];
  rideLogSyncStatuses: Record<string, RideLogSyncStatus>;
  rideLogsReady: boolean;
  rideLogsLoading: boolean;
  rideLogsError: boolean;
  reloadRideLogs: () => Promise<void>;
  recentRideSearches: string[];
  addRecentRideSearch: (search: string) => void;
  addRideLog: (rideLog: RideLog) => Promise<void>;
  updateRideLog: (rideLog: RideLog) => Promise<void>;
  removeRideLog: (logId: string) => Promise<void>;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [rideDetailsOpen, setRideDetailsOpen] = useState(false);
  const [previousTabPath, setPreviousTabPath] = useState('/');
  const [rideLogs, setRideLogs] = useState<RideLog[]>([]);
  const [rideLogSyncStatuses, setRideLogSyncStatuses] = useState<
    Record<string, RideLogSyncStatus>
  >({});
  const [rideLogsLoading, setRideLogsLoading] = useState(true);
  const [rideLogsReady, setRideLogsReady] = useState(false);
  const [rideLogsError, setRideLogsError] = useState(false);
  const [pendingOperationCount, setPendingOperationCount] = useState(0);
  const [recentRideSearches, setRecentRideSearches] = useState<string[]>([]);
  const rideLogsRef = useRef(rideLogs);
  const operationsRef = useRef<RideLogOperation[]>([]);
  const userIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);
  const cacheWriteRef = useRef(Promise.resolve());
  const syncRef = useRef<() => Promise<void>>(async () => undefined);

  const persistRideLogs = (
    userId: string,
    logs: RideLog[],
    operations: RideLogOperation[],
  ) => {
    const cache: CachedRideLogs = { logs, operations };
    const write = cacheWriteRef.current.then(() =>
      Storage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(cache)),
    );
    cacheWriteRef.current = write.catch(() => undefined);
    return write;
  };

  const syncRideLogs = async () => {
    const userId = userIdRef.current;
    if (!userId || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setRideLogsError(false);

    try {
      for (const operation of [...operationsRef.current]) {
        try {
          if (operation.type === 'upsert') {
            const { rideLog: savedLog, removedPhotoPaths } =
              await saveRemoteRideLog(
                operation.rideLog,
                operation.previousPhotoPaths,
              );
            await deleteRideLogPhotos(removedPhotoPaths);
            const hasNewerOperation = operationsRef.current.some((pending) => {
              const pendingLogId =
                pending.type === 'upsert' ? pending.rideLog.id : pending.logId;
              return (
                pendingLogId === savedLog.id &&
                pending.mutationId !== operation.mutationId
              );
            });
            if (!hasNewerOperation) {
              deleteCachedRideLogPhotos(
                (operation.rideLog.photos ?? []).filter(
                  (photo) =>
                    (photo.startsWith('file:') ||
                      photo.startsWith('content:')) &&
                    !savedLog.photos?.includes(photo),
                ),
              );
              rideLogsRef.current = sortRideLogs([
                ...rideLogsRef.current.filter((log) => log.id !== savedLog.id),
                savedLog,
              ]);
              setRideLogs(rideLogsRef.current);
            }
          } else {
            await deleteRemoteRideLog(operation.logId);
            await deleteRideLogPhotos(operation.photoPaths);
            deleteCachedRideLogPhotos(operation.localPhotoUris);
          }

          operationsRef.current = operationsRef.current.filter(
            (pending) => pending.mutationId !== operation.mutationId,
          );
          setPendingOperationCount(operationsRef.current.length);
          setRideLogSyncStatuses((statuses) => {
            const nextStatuses = { ...statuses };
            const hasMoreForLog = operationsRef.current.some((pending) =>
              pending.type === 'upsert'
                ? pending.rideLog.id ===
                  (operation.type === 'upsert' ? operation.rideLog.id : '')
                : pending.logId ===
                  (operation.type === 'delete' ? operation.logId : ''),
            );
            if (!hasMoreForLog) {
              delete nextStatuses[
                operation.type === 'upsert'
                  ? operation.rideLog.id
                  : operation.logId
              ];
            }
            return nextStatuses;
          });
          await persistRideLogs(
            userId,
            rideLogsRef.current,
            operationsRef.current,
          );
        } catch {
          const logId =
            operation.type === 'upsert'
              ? operation.rideLog.id
              : operation.logId;
          setRideLogSyncStatuses((statuses) => ({
            ...statuses,
            [logId]: 'failed',
          }));
          await persistRideLogs(
            userId,
            rideLogsRef.current,
            operationsRef.current,
          );
          break;
        }
      }

      const serverLogs = await fetchRideLogs();
      const mergedLogs = new Map(serverLogs.map((log) => [log.id, log]));
      operationsRef.current.forEach((operation) => {
        if (operation.type === 'delete') mergedLogs.delete(operation.logId);
        else mergedLogs.set(operation.rideLog.id, operation.rideLog);
      });
      rideLogsRef.current = sortRideLogs([...mergedLogs.values()]);
      setRideLogs(rideLogsRef.current);
      setRideLogsError(false);
      await persistRideLogs(userId, rideLogsRef.current, operationsRef.current);
    } catch {
      setRideLogsError(true);
    } finally {
      isSyncingRef.current = false;
      setRideLogsLoading(false);
    }
  };
  useEffect(() => {
    syncRef.current = syncRideLogs;
  });

  useEffect(() => {
    let isMounted = true;

    const loadRideLogs = async () => {
      if (!supabase) {
        setRideLogsLoading(false);
        setRideLogsError(true);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error('Sign in to load ride logs.');
        if (!isMounted) return;

        const userId = data.session.user.id;
        userIdRef.current = userId;
        const cachedValue = await Storage.getItem(
          `${CACHE_KEY_PREFIX}${userId}`,
        );
        if (cachedValue) {
          const cached = JSON.parse(cachedValue) as CachedRideLogs;
          operationsRef.current = cached.operations ?? [];
          rideLogsRef.current = cached.logs ?? [];
          setRideLogs(rideLogsRef.current);
          setPendingOperationCount(operationsRef.current.length);
          setRideLogSyncStatuses(
            Object.fromEntries(
              operationsRef.current.map((operation) => [
                operation.type === 'upsert'
                  ? operation.rideLog.id
                  : operation.logId,
                'pending',
              ]),
            ),
          );
          setRideLogsLoading(false);
        }

        setRideLogsReady(true);
        await syncRef.current();
      } catch {
        if (isMounted) {
          setRideLogsError(true);
          setRideLogsLoading(false);
        }
      }
    };

    void loadRideLogs();
    const subscription = ReactNativeAppState.addEventListener(
      'change',
      (nextState) => {
        if (nextState === 'active') void syncRef.current();
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (pendingOperationCount === 0) return;
    const interval = setInterval(
      () => void syncRef.current(),
      SYNC_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [pendingOperationCount]);

  const queueRideLogOperation = async (operation: RideLogOperation) => {
    const userId = userIdRef.current;
    if (!userId) throw new Error('Ride logs are not ready. Please try again.');

    operationsRef.current = [
      ...operationsRef.current.filter(
        (pending) =>
          (pending.type === 'upsert' ? pending.rideLog.id : pending.logId) !==
          (operation.type === 'upsert'
            ? operation.rideLog.id
            : operation.logId),
      ),
      operation,
    ];
    setPendingOperationCount(operationsRef.current.length);
    const operationLogId =
      operation.type === 'upsert' ? operation.rideLog.id : operation.logId;
    setRideLogSyncStatuses((statuses) => ({
      ...statuses,
      [operationLogId]: 'pending',
    }));

    if (operation.type === 'upsert') {
      rideLogsRef.current = sortRideLogs([
        ...rideLogsRef.current.filter((log) => log.id !== operation.rideLog.id),
        operation.rideLog,
      ]);
    } else {
      rideLogsRef.current = rideLogsRef.current.filter(
        (log) => log.id !== operation.logId,
      );
    }
    setRideLogs(rideLogsRef.current);
    await persistRideLogs(userId, rideLogsRef.current, operationsRef.current);
    await syncRef.current();
  };

  const value: AppState = {
    tabBarHidden,
    setTabBarHidden,
    rideDetailsOpen,
    setRideDetailsOpen,
    previousTabPath,
    setPreviousTabPath,
    rideLogs,
    rideLogSyncStatuses,
    rideLogsReady,
    rideLogsLoading,
    rideLogsError,
    reloadRideLogs: async () => {
      setRideLogsLoading(rideLogsRef.current.length === 0);
      await syncRef.current();
    },
    recentRideSearches,
    addRecentRideSearch: (search) => {
      const normalizedSearch = search.trim();
      if (!normalizedSearch) return;
      setRecentRideSearches((searches) =>
        [
          normalizedSearch,
          ...searches.filter(
            (existingSearch) =>
              existingSearch.toLocaleLowerCase() !==
              normalizedSearch.toLocaleLowerCase(),
          ),
        ].slice(0, 50),
      );
    },
    addRideLog: (rideLog) =>
      queueRideLogOperation({
        mutationId: `${Date.now()}-${Math.random()}`,
        type: 'upsert',
        rideLog,
        previousPhotoPaths: [],
      }),
    updateRideLog: (rideLog) => {
      const previousOperation = operationsRef.current.find(
        (operation) =>
          operation.type === 'upsert' && operation.rideLog.id === rideLog.id,
      );
      const existingLog = rideLogsRef.current.find(
        (entry) => entry.id === rideLog.id,
      );
      return queueRideLogOperation({
        mutationId: `${Date.now()}-${Math.random()}`,
        type: 'upsert',
        rideLog,
        previousPhotoPaths:
          (previousOperation?.type === 'upsert'
            ? previousOperation.previousPhotoPaths
            : existingLog?.photoPaths) ?? [],
      });
    },
    removeRideLog: (logId) => {
      const log = rideLogsRef.current.find((entry) => entry.id === logId);
      const previousOperation = operationsRef.current.find(
        (operation) =>
          operation.type === 'upsert' && operation.rideLog.id === logId,
      );
      return queueRideLogOperation({
        mutationId: `${Date.now()}-${Math.random()}`,
        type: 'delete',
        logId,
        photoPaths: [
          ...new Set([
            ...(log?.photoPaths ?? []).filter(Boolean),
            ...(previousOperation?.type === 'upsert'
              ? previousOperation.previousPhotoPaths
              : []),
          ]),
        ],
        localPhotoUris: [
          ...new Set([
            ...(log?.photos ?? []).filter(
              (photo) =>
                photo.startsWith('file:') || photo.startsWith('content:'),
            ),
            ...(previousOperation?.type === 'upsert'
              ? (previousOperation.rideLog.photos ?? []).filter(
                  (photo) =>
                    photo.startsWith('file:') || photo.startsWith('content:'),
                )
              : []),
          ]),
        ],
      });
    },
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context)
    throw new Error('useAppState must be used within AppStateProvider');
  return context;
}
