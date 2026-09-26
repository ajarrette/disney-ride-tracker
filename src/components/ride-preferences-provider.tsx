import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  fetchPinnedRideIds,
  savePinnedRideOrder,
} from '@/data/ride-preferences';

type RidePreferencesContextValue = {
  pinnedRideIds: Set<string>;
  pinnedRideOrder: string[];
  setRidePinned: (rideId: string, isPinned: boolean) => void;
  setPinnedRideOrder: (rideIds: string[]) => void;
};

const RidePreferencesContext =
  createContext<RidePreferencesContextValue | null>(null);

export function RidePreferencesProvider({ children }: React.PropsWithChildren) {
  const [pinnedRideIds, setPinnedRideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pinnedRideOrder, setPinnedRideOrderState] = useState<string[]>([]);
  const pinnedRideIdsRef = useRef(pinnedRideIds);
  const pinnedRideOrderRef = useRef(pinnedRideOrder);
  const locallyChangedRideIds = useRef(new Set<string>());
  const pendingPinChanges = useRef(new Set<string>());
  const preferencesLoaded = useRef(false);
  const writeSequence = useRef(0);
  const pendingWrite = useRef(Promise.resolve());

  const updatePinnedRideOrder = useCallback((rideIds: string[]) => {
    const nextOrder = [...new Set(rideIds)];
    const nextIds = new Set(nextOrder);
    pinnedRideOrderRef.current = nextOrder;
    pinnedRideIdsRef.current = nextIds;
    setPinnedRideOrderState(nextOrder);
    setPinnedRideIds(nextIds);
  }, []);

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

  useEffect(() => {
    let isMounted = true;

    void fetchPinnedRideIds()
      .then((rideIds) => {
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
        const previousOrder = pinnedRideOrderRef.current;
        updatePinnedRideOrder(nextOrder);
        preferencesLoaded.current = true;
        if (pendingPinChanges.current.size > 0) {
          pendingPinChanges.current.clear();
          persistPinnedRideOrder(nextOrder, previousOrder);
        }
      })
      .catch((error) => {
        console.warn('Unable to load ride preferences.', error);
        preferencesLoaded.current = true;
        if (pendingPinChanges.current.size > 0) {
          pendingPinChanges.current.clear();
          persistPinnedRideOrder(
            pinnedRideOrderRef.current,
            pinnedRideOrderRef.current,
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [persistPinnedRideOrder, updatePinnedRideOrder]);

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
        setRidePinned,
        setPinnedRideOrder,
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
