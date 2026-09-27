import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppTabs from '@/components/app-tabs';
import { AuthGate } from '@/components/auth-gate';
import { RideCatalogProvider } from '@/components/ride-catalog-provider';
import { RidePreferencesProvider } from '@/components/ride-preferences-provider';
import { RideTripsProvider } from '@/components/ride-trips-provider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGate>
        <ThemeProvider value={DefaultTheme}>
          <RideCatalogProvider>
            <RidePreferencesProvider>
              <RideTripsProvider>
                <AppTabs />
              </RideTripsProvider>
            </RidePreferencesProvider>
          </RideCatalogProvider>
        </ThemeProvider>
      </AuthGate>
    </GestureHandlerRootView>
  );
}
