import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { fetchPinnedRideIds, saveRidePin } from '@/data/ride-preferences';

type RidePreferencesContextValue = {
  pinnedRideIds: Set<string>;
  setRidePinned: (rideId: string, isPinned: boolean) => void;
};

const RidePreferencesContext =
  createContext<RidePreferencesContextValue | null>(null);

export function RidePreferencesProvider({ children }: React.PropsWithChildren) {
  const [pinnedRideIds, setPinnedRideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pinnedRideIdsRef = useRef(pinnedRideIds);
  const locallyChangedRideIds = useRef(new Set<string>());
  const writeSequences = useRef(new Map<string, number>());
  const pendingWrites = useRef(new Map<string, Promise<void>>());

  const updatePinnedRideIds = (rideId: string, isPinned: boolean) => {
    const next = new Set(pinnedRideIdsRef.current);
    if (isPinned) next.add(rideId);
    else next.delete(rideId);
    pinnedRideIdsRef.current = next;
    setPinnedRideIds(next);
  };

  useEffect(() => {
    let isMounted = true;

    void fetchPinnedRideIds()
      .then((rideIds) => {
        if (!isMounted) return;
        const next = new Set(rideIds);
        locallyChangedRideIds.current.forEach((rideId) => {
          if (pinnedRideIdsRef.current.has(rideId)) next.add(rideId);
          else next.delete(rideId);
        });
        pinnedRideIdsRef.current = next;
        setPinnedRideIds(next);
      })
      .catch((error) =>
        console.warn('Unable to load ride preferences.', error),
      );

    return () => {
      isMounted = false;
    };
  }, []);

  const setRidePinned = (rideId: string, isPinned: boolean) => {
    const previousValue = pinnedRideIdsRef.current.has(rideId);
    if (previousValue === isPinned) return;

    locallyChangedRideIds.current.add(rideId);
    updatePinnedRideIds(rideId, isPinned);

    const sequence = (writeSequences.current.get(rideId) ?? 0) + 1;
    writeSequences.current.set(rideId, sequence);
    const previousWrite =
      pendingWrites.current.get(rideId) ?? Promise.resolve();
    const write = previousWrite
      .catch(() => undefined)
      .then(() => saveRidePin(rideId, isPinned))
      .catch((error) => {
        console.warn('Unable to save ride preference.', error);
        if (writeSequences.current.get(rideId) === sequence) {
          updatePinnedRideIds(rideId, previousValue);
        }
      });
    pendingWrites.current.set(rideId, write);
    void write.finally(() => {
      if (pendingWrites.current.get(rideId) === write) {
        pendingWrites.current.delete(rideId);
      }
    });
  };

  return (
    <RidePreferencesContext.Provider value={{ pinnedRideIds, setRidePinned }}>
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
