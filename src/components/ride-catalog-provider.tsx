import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useEffect, useState } from 'react';

import { fetchRideCatalog } from '@/data/ride-catalog';
import { supabase } from '@/data/supabase';
import { Ride } from '@/models/ride';

const CACHE_KEY = 'ride-catalog:v1';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type CachedCatalog = {
  fetchedAt: number;
  rides: Ride[];
};

type RideCatalogContextValue = {
  rides: Ride[];
  isLoading: boolean;
  hasError: boolean;
};

const RideCatalogContext = createContext<RideCatalogContextValue | null>(null);

export function RideCatalogProvider({ children }: React.PropsWithChildren) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      let cached: CachedCatalog | null = null;

      try {
        const storedValue = await Storage.getItem(CACHE_KEY);
        if (storedValue) {
          const parsed = JSON.parse(storedValue) as CachedCatalog;
          if (
            Number.isFinite(parsed.fetchedAt) &&
            Array.isArray(parsed.rides)
          ) {
            cached = parsed;
            if (isMounted) {
              setRides(parsed.rides);
              setIsLoading(false);
            }
          }
        }
      } catch {
        cached = null;
      }

      if (cached && Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
        return;
      }

      if (!supabase) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const freshRides = await fetchRideCatalog();
        await Storage.setItem(
          CACHE_KEY,
          JSON.stringify({ fetchedAt: Date.now(), rides: freshRides }),
        );
        if (isMounted) {
          setRides(freshRides);
          setHasError(false);
        }
      } catch (error) {
        console.warn('Unable to load the ride catalog.', error);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <RideCatalogContext.Provider value={{ rides, isLoading, hasError }}>
      {children}
    </RideCatalogContext.Provider>
  );
}

export function useRideCatalog() {
  const context = useContext(RideCatalogContext);
  if (!context) {
    throw new Error('useRideCatalog must be used within RideCatalogProvider.');
  }
  return context;
}
