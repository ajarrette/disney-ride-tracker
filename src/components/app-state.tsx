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
  previousTabPath: string;
  setPreviousTabPath: Dispatch<SetStateAction<string>>;
  rideLogs: RideLog[];
  addRideLog: (rideLog: RideLog) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [previousTabPath, setPreviousTabPath] = useState('/');
  const [rideLogs, setRideLogs] = useState<RideLog[]>([]);

  const value: AppState = {
    tabBarHidden,
    setTabBarHidden,
    previousTabPath,
    setPreviousTabPath,
    rideLogs,
    addRideLog: (rideLog) => setRideLogs((logs) => [rideLog, ...logs]),
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
