import { DefaultTheme, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppTabs from '@/components/app-tabs';
import { AuthGate } from '@/components/auth-gate';
import { ResortPreferencesProvider } from '@/components/resort-preferences-provider';
import { RideCatalogProvider } from '@/components/ride-catalog-provider';
import { RidePreferencesProvider } from '@/components/ride-preferences-provider';
import { RideTripsProvider } from '@/components/ride-trips-provider';

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGate>
        <ThemeProvider value={DefaultTheme}>
          <ResortPreferencesProvider>
            <RideCatalogProvider>
              <RidePreferencesProvider>
                <RideTripsProvider>
                  <AppTabs />
                </RideTripsProvider>
              </RidePreferencesProvider>
            </RideCatalogProvider>
          </ResortPreferencesProvider>
        </ThemeProvider>
      </AuthGate>
    </GestureHandlerRootView>
  );
}
