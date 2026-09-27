import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  fetchRidePreferences,
  saveRideFavorite,
  saveRideHidden,
  savePinnedRideOrder,
} from '@/data/ride-preferences';

type RidePreferencesContextValue = {
  pinnedRideIds: Set<string>;
  pinnedRideOrder: string[];
  favoriteRideIds: Set<string>;
  hiddenRideIds: Set<string>;
  isLoading: boolean;
  setRidePinned: (rideId: string, isPinned: boolean) => void;
  setPinnedRideOrder: (rideIds: string[]) => void;
  setRideFavorite: (rideId: string, isFavorite: boolean) => void;
  setRideHidden: (rideId: string, isHidden: boolean) => void;
};

const RidePreferencesContext =
  createContext<RidePreferencesContextValue | null>(null);

export function RidePreferencesProvider({ children }: React.PropsWithChildren) {
  const [pinnedRideIds, setPinnedRideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hiddenRideIds, setHiddenRideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [favoriteRideIds, setFavoriteRideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pinnedRideOrder, setPinnedRideOrderState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pinnedRideIdsRef = useRef(pinnedRideIds);
  const hiddenRideIdsRef = useRef(hiddenRideIds);
  const favoriteRideIdsRef = useRef(favoriteRideIds);
  const pinnedRideOrderRef = useRef(pinnedRideOrder);
  const locallyChangedRideIds = useRef(new Set<string>());
  const locallyChangedHiddenRideIds = useRef(new Set<string>());
  const locallyChangedFavoriteRideIds = useRef(new Set<string>());
  const pendingPinChanges = useRef(new Set<string>());
  const pendingHiddenChanges = useRef(
    new Map<string, { isHidden: boolean; previousValue: boolean }>(),
  );
  const pendingFavoriteChanges = useRef(
    new Map<string, { isFavorite: boolean; previousValue: boolean }>(),
  );
  const preferencesLoaded = useRef(false);
  const writeSequence = useRef(0);
  const pendingWrite = useRef(Promise.resolve());
  const hiddenWriteSequences = useRef(new Map<string, number>());
  const pendingHiddenWrites = useRef(new Map<string, Promise<void>>());
  const favoriteWriteSequences = useRef(new Map<string, number>());
  const pendingFavoriteWrites = useRef(new Map<string, Promise<void>>());

  const updatePinnedRideOrder = useCallback((rideIds: string[]) => {
    const nextOrder = [...new Set(rideIds)];
    const nextIds = new Set(nextOrder);
    pinnedRideOrderRef.current = nextOrder;
    pinnedRideIdsRef.current = nextIds;
    setPinnedRideOrderState(nextOrder);
    setPinnedRideIds(nextIds);
  }, []);

  const updateHiddenRideIds = useCallback((rideIds: Iterable<string>) => {
    const nextIds = new Set(rideIds);
    hiddenRideIdsRef.current = nextIds;
    setHiddenRideIds(nextIds);
  }, []);

  const updateFavoriteRideIds = useCallback((rideIds: Iterable<string>) => {
    const nextIds = new Set(rideIds);
    favoriteRideIdsRef.current = nextIds;
    setFavoriteRideIds(nextIds);
  }, []);

  const persistRideHidden = useCallback(
    (rideId: string, isHidden: boolean, previousValue: boolean) => {
      const sequence = (hiddenWriteSequences.current.get(rideId) ?? 0) + 1;
      hiddenWriteSequences.current.set(rideId, sequence);
      const previousWrite =
        pendingHiddenWrites.current.get(rideId) ?? Promise.resolve();
      const write = previousWrite
        .catch(() => undefined)
        .then(() => saveRideHidden(rideId, isHidden))
        .catch((error) => {
          console.warn('Unable to save ride visibility.', error);
          if (hiddenWriteSequences.current.get(rideId) === sequence) {
            const nextIds = new Set(hiddenRideIdsRef.current);
            if (previousValue) nextIds.add(rideId);
            else nextIds.delete(rideId);
            updateHiddenRideIds(nextIds);
          }
        });
      pendingHiddenWrites.current.set(rideId, write);
    },
    [updateHiddenRideIds],
  );

  const persistRideFavorite = useCallback(
    (rideId: string, isFavorite: boolean, previousValue: boolean) => {
      const sequence = (favoriteWriteSequences.current.get(rideId) ?? 0) + 1;
      favoriteWriteSequences.current.set(rideId, sequence);
      const previousWrite =
        pendingFavoriteWrites.current.get(rideId) ?? Promise.resolve();
      const write = previousWrite
        .catch(() => undefined)
        .then(() => saveRideFavorite(rideId, isFavorite))
        .catch((error) => {
          console.warn('Unable to save ride favorite.', error);
          if (favoriteWriteSequences.current.get(rideId) === sequence) {
            const nextIds = new Set(favoriteRideIdsRef.current);
            if (previousValue) nextIds.add(rideId);
            else nextIds.delete(rideId);
            updateFavoriteRideIds(nextIds);
          }
        });
      pendingFavoriteWrites.current.set(rideId, write);
    },
    [updateFavoriteRideIds],
  );

  const persistPinnedRideOrder = useCallback(
    (rideIds: string[], previousOrder: string[]) => {
      const sequence = ++writeSequence.current;
      const previousWrite = pendingWrite.current;
      const write = previousWrite
        .catch(() => undefined)
        .then(() => savePinnedRideOrder(rideIds))
        .catch((error) => {
          console.warn('Unable to save ride preferences.', error);
          if (writeSequence.current === sequence) {
            updatePinnedRideOrder(previousOrder);
          }
        });
      pendingWrite.current = write;
    },
    [updatePinnedRideOrder],
  );

  const setPinnedRideOrder = (rideIds: string[]) => {
    const previousOrder = pinnedRideOrderRef.current;
    updatePinnedRideOrder(rideIds);
    if (preferencesLoaded.current) {
      persistPinnedRideOrder(rideIds, previousOrder);
    }
  };

  const setRideHidden = (rideId: string, isHidden: boolean) => {
    const previousValue = hiddenRideIdsRef.current.has(rideId);
    if (previousValue === isHidden) return;

    locallyChangedHiddenRideIds.current.add(rideId);
    const nextIds = new Set(hiddenRideIdsRef.current);
    if (isHidden) nextIds.add(rideId);
    else nextIds.delete(rideId);
    updateHiddenRideIds(nextIds);

    if (preferencesLoaded.current) {
      persistRideHidden(rideId, isHidden, previousValue);
    } else {
      const pending = pendingHiddenChanges.current.get(rideId);
      pendingHiddenChanges.current.set(rideId, {
        isHidden,
        previousValue: pending?.previousValue ?? previousValue,
      });
    }
  };

  const setRideFavorite = (rideId: string, isFavorite: boolean) => {
    const previousValue = favoriteRideIdsRef.current.has(rideId);
    if (previousValue === isFavorite) return;

    locallyChangedFavoriteRideIds.current.add(rideId);
    const nextIds = new Set(favoriteRideIdsRef.current);
    if (isFavorite) nextIds.add(rideId);
    else nextIds.delete(rideId);
    updateFavoriteRideIds(nextIds);

    if (preferencesLoaded.current) {
      persistRideFavorite(rideId, isFavorite, previousValue);
    } else {
      const pending = pendingFavoriteChanges.current.get(rideId);
      pendingFavoriteChanges.current.set(rideId, {
        isFavorite,
        previousValue: pending?.previousValue ?? previousValue,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    void fetchRidePreferences()
      .then(
        ({
          pinnedRideOrder: rideIds,
          favoriteRideIds: fetchedFavoriteIds,
          hiddenRideIds: fetchedHiddenIds,
        }) => {
          if (!isMounted) return;
          const nextOrder = rideIds.filter(
            (rideId) => !locallyChangedRideIds.current.has(rideId),
          );
          locallyChangedRideIds.current.forEach((rideId) => {
            if (
              pinnedRideIdsRef.current.has(rideId) &&
              !nextOrder.includes(rideId)
            ) {
              nextOrder.push(rideId);
            }
          });
          const fetchedHiddenIdSet = new Set(fetchedHiddenIds);
          const nextHiddenIds = new Set(
            fetchedHiddenIds.filter(
              (rideId) => !locallyChangedHiddenRideIds.current.has(rideId),
            ),
          );
          locallyChangedHiddenRideIds.current.forEach((rideId) => {
            if (hiddenRideIdsRef.current.has(rideId)) nextHiddenIds.add(rideId);
          });
          const fetchedFavoriteIdSet = new Set(fetchedFavoriteIds);
          const nextFavoriteIds = new Set(
            fetchedFavoriteIds.filter(
              (rideId) => !locallyChangedFavoriteRideIds.current.has(rideId),
            ),
          );
          locallyChangedFavoriteRideIds.current.forEach((rideId) => {
            if (favoriteRideIdsRef.current.has(rideId))
              nextFavoriteIds.add(rideId);
          });
          const previousOrder = pinnedRideOrderRef.current;
          updatePinnedRideOrder(nextOrder);
          updateHiddenRideIds(nextHiddenIds);
          updateFavoriteRideIds(nextFavoriteIds);
          preferencesLoaded.current = true;
          setIsLoading(false);
          if (pendingPinChanges.current.size > 0) {
            pendingPinChanges.current.clear();
            persistPinnedRideOrder(nextOrder, previousOrder);
          }
          pendingHiddenChanges.current.forEach(({ isHidden }, rideId) => {
            persistRideHidden(rideId, isHidden, fetchedHiddenIdSet.has(rideId));
          });
          pendingHiddenChanges.current.clear();
          pendingFavoriteChanges.current.forEach(({ isFavorite }, rideId) => {
            persistRideFavorite(
              rideId,
              isFavorite,
              fetchedFavoriteIdSet.has(rideId),
            );
          });
          pendingFavoriteChanges.current.clear();
        },
      )
      .catch((error) => {
        if (!isMounted) return;
        console.warn('Unable to load ride preferences.', error);
        preferencesLoaded.current = true;
        setIsLoading(false);
        if (pendingPinChanges.current.size > 0) {
          pendingPinChanges.current.clear();
          persistPinnedRideOrder(
            pinnedRideOrderRef.current,
            pinnedRideOrderRef.current,
          );
        }
        pendingHiddenChanges.current.forEach(
          ({ isHidden, previousValue }, rideId) => {
            persistRideHidden(rideId, isHidden, previousValue);
          },
        );
        pendingHiddenChanges.current.clear();
        pendingFavoriteChanges.current.forEach(
          ({ isFavorite, previousValue }, rideId) => {
            persistRideFavorite(rideId, isFavorite, previousValue);
          },
        );
        pendingFavoriteChanges.current.clear();
      });

    return () => {
      isMounted = false;
    };
  }, [
    persistPinnedRideOrder,
    persistRideFavorite,
    persistRideHidden,
    updateFavoriteRideIds,
    updateHiddenRideIds,
    updatePinnedRideOrder,
  ]);

  const setRidePinned = (rideId: string, isPinned: boolean) => {
    const previousValue = pinnedRideIdsRef.current.has(rideId);
    if (previousValue === isPinned) return;

    locallyChangedRideIds.current.add(rideId);
    const previousOrder = pinnedRideOrderRef.current;
    const nextOrder = isPinned
      ? [...previousOrder, rideId]
      : previousOrder.filter((id) => id !== rideId);
    updatePinnedRideOrder(nextOrder);

    if (preferencesLoaded.current) {
      persistPinnedRideOrder(nextOrder, previousOrder);
    } else {
      pendingPinChanges.current.add(rideId);
    }
  };

  return (
    <RidePreferencesContext.Provider
      value={{
        pinnedRideIds,
        pinnedRideOrder,
        favoriteRideIds,
        hiddenRideIds,
        isLoading,
        setRidePinned,
        setPinnedRideOrder,
        setRideFavorite,
        setRideHidden,
      }}
    >
      {children}
    </RidePreferencesContext.Provider>
  );
}

export function useRidePreferences() {
  const context = useContext(RidePreferencesContext);
  if (!context) {
    throw new Error(
      'useRidePreferences must be used within RidePreferencesProvider.',
    );
  }
  return context;
}
