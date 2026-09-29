import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useState } from 'react';

import { ResortOptions, ResortScopeId } from '@/constants/resorts';

const RESORT_SCOPE_STORAGE_KEY = 'resort-scope:v1';
const LEGACY_RIDE_LOG_FILTER_KEY = 'ride-log-resort-filter:v1';

const getSavedResortScope = (value: string | null) =>
  ResortOptions.find((option) => option.id === value)?.id;

const readResortScope = (): ResortScopeId => {
  try {
    const savedScope = getSavedResortScope(
      Storage.getItemSync(RESORT_SCOPE_STORAGE_KEY),
    );
    if (savedScope) return savedScope;

    const legacyScope = getSavedResortScope(
      Storage.getItemSync(LEGACY_RIDE_LOG_FILTER_KEY),
    );
    if (legacyScope) {
      Storage.setItemSync(RESORT_SCOPE_STORAGE_KEY, legacyScope);
      return legacyScope;
    }
  } catch {}
  return 'all';
};

type ResortPreferences = {
  selectedResortId: ResortScopeId;
  setSelectedResortId: (resortId: ResortScopeId) => void;
};

const ResortPreferencesContext = createContext<ResortPreferences | null>(null);

export function ResortPreferencesProvider({
  children,
}: React.PropsWithChildren) {
  const [selectedResortId, setSelectedResortIdState] =
    useState<ResortScopeId>(readResortScope);

  const setSelectedResortId = (resortId: ResortScopeId) => {
    setSelectedResortIdState(resortId);
    try {
      Storage.setItemSync(RESORT_SCOPE_STORAGE_KEY, resortId);
    } catch (error) {
      console.warn('Unable to save resort preference.', error);
    }
  };

  return (
    <ResortPreferencesContext.Provider
      value={{ selectedResortId, setSelectedResortId }}
    >
      {children}
    </ResortPreferencesContext.Provider>
  );
}

export function useResortPreferences() {
  const context = useContext(ResortPreferencesContext);
  if (!context) {
    throw new Error(
      'useResortPreferences must be used within ResortPreferencesProvider.',
    );
  }
  return context;
}
