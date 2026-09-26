import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AuthGate } from '@/components/auth-gate';
import AppTabs from '@/components/app-tabs';
import { RideCatalogProvider } from '@/components/ride-catalog-provider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AuthGate>
      <ThemeProvider value={DefaultTheme}>
        <RideCatalogProvider>
          <AppTabs />
        </RideCatalogProvider>
      </ThemeProvider>
    </AuthGate>
  );
}
