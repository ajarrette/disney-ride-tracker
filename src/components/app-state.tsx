import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import { RideLog } from '@/models/ride-log';

type AppState = {
  tabBarHidden: boolean;
  setTabBarHidden: Dispatch<SetStateAction<boolean>>;
  rideDetailsOpen: boolean;
  setRideDetailsOpen: Dispatch<SetStateAction<boolean>>;
  previousTabPath: string;
  setPreviousTabPath: Dispatch<SetStateAction<string>>;
  rideLogs: RideLog[];
  recentRideSearches: string[];
  addRecentRideSearch: (search: string) => void;
  addRideLog: (rideLog: RideLog) => void;
  updateRideLog: (rideLog: RideLog) => void;
  removeRideLog: (logId: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [rideDetailsOpen, setRideDetailsOpen] = useState(false);
  const [previousTabPath, setPreviousTabPath] = useState('/');
  const [rideLogs, setRideLogs] = useState<RideLog[]>([]);
  const [recentRideSearches, setRecentRideSearches] = useState<string[]>([]);

  const value: AppState = {
    tabBarHidden,
    setTabBarHidden,
    rideDetailsOpen,
    setRideDetailsOpen,
    previousTabPath,
    setPreviousTabPath,
    rideLogs,
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
    addRideLog: (rideLog) => setRideLogs((logs) => [rideLog, ...logs]),
    updateRideLog: (rideLog) =>
      setRideLogs((logs) =>
        logs.map((log) => (log.id === rideLog.id ? rideLog : log)),
      ),
    removeRideLog: (logId) =>
      setRideLogs((logs) => logs.filter((log) => log.id !== logId)),
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
