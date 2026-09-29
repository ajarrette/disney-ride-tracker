import Storage from 'expo-sqlite/kv-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { fetchRideCatalog } from '@/data/ride-catalog';
import { supabase } from '@/data/supabase';
import { Ride } from '@/models/ride';

const CACHE_KEY = 'ride-catalog:v3';

type CachedCatalog = {
  fetchedAt: number;
  rides: Ride[];
};

type RideCatalogContextValue = {
  rides: Ride[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  refreshCatalog: () => Promise<Ride[] | null>;
};

const RideCatalogContext = createContext<RideCatalogContextValue | null>(null);

export function RideCatalogProvider({ children }: React.PropsWithChildren) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const refreshCatalog = useCallback(async () => {
    if (!supabase) {
      setHasError(true);
      setIsLoading(false);
      return null;
    }

    setIsRefreshing(true);
    try {
      const freshRides = await fetchRideCatalog();
      await Storage.setItem(
        CACHE_KEY,
        JSON.stringify({ fetchedAt: Date.now(), rides: freshRides }),
      );
      setRides(freshRides);
      setHasError(false);
      return freshRides;
    } catch (error) {
      console.warn('Unable to load the ride catalog.', error);
      setHasError(true);
      return null;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const storedValue = await Storage.getItem(CACHE_KEY);
        if (storedValue) {
          const parsed = JSON.parse(storedValue) as CachedCatalog;
          if (
            Number.isFinite(parsed.fetchedAt) &&
            Array.isArray(parsed.rides)
          ) {
            if (isMounted) {
              setRides(parsed.rides);
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.warn('Unable to read the cached ride catalog.', error);
      }

      if (isMounted) await refreshCatalog();
    };

    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [refreshCatalog]);

  return (
    <RideCatalogContext.Provider
      value={{ rides, isLoading, isRefreshing, hasError, refreshCatalog }}
    >
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
