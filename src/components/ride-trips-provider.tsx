import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  createRideTrip as createRemoteRideTrip,
  fetchRideTrips,
  updateRideTrip as updateRemoteRideTrip,
} from '@/data/ride-trips';
import { RideTrip, RideTripInput } from '@/models/ride-trip';

type RideTripsContextValue = {
  trips: RideTrip[];
  isLoading: boolean;
  createTrip: (input: RideTripInput) => Promise<RideTrip>;
  updateTrip: (trip: RideTrip) => Promise<RideTrip>;
};

const RideTripsContext = createContext<RideTripsContextValue | null>(null);

export function RideTripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<RideTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void fetchRideTrips()
      .then((loadedTrips) => {
        if (isMounted) setTrips(loadedTrips);
      })
      .catch((error) => {
        console.warn('Unable to load trips.', error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createTrip = async (input: RideTripInput) => {
    const trip = await createRemoteRideTrip(input);
    setTrips((currentTrips) =>
      [...currentTrips, trip].sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      ),
    );
    return trip;
  };

  const updateTrip = async (trip: RideTrip) => {
    const savedTrip = await updateRemoteRideTrip(trip);
    setTrips((currentTrips) =>
      currentTrips.map((currentTrip) =>
        currentTrip.id === savedTrip.id ? savedTrip : currentTrip,
      ),
    );
    return savedTrip;
  };

  return (
    <RideTripsContext.Provider
      value={{ trips, isLoading, createTrip, updateTrip }}
    >
      {children}
    </RideTripsContext.Provider>
  );
}

export function useRideTrips() {
  const context = useContext(RideTripsContext);
  if (!context)
    throw new Error('useRideTrips must be used within RideTripsProvider');
  return context;
}
