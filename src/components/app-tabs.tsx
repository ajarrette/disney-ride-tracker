import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { AppStateProvider, useAppState } from './app-state';

export default function AppTabs() {
  return (
    <AppStateProvider>
      <NativeTabNavigator />
    </AppStateProvider>
  );
}

function NativeTabNavigator() {
  const colors = Colors.light;
  const pathname = usePathname();
  const { tabBarHidden, rideDetailsOpen, setPreviousTabPath } = useAppState();

  useEffect(() => {
    if (pathname !== '/log') setPreviousTabPath(pathname);
  }, [pathname, setPreviousTabPath]);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={{ default: colors.textSecondary, selected: colors.accent }}
      hidden={tabBarHidden || (rideDetailsOpen && pathname === '/')}
    >
      <NativeTabs.Trigger name='index' disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label hidden>Disney World</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/magic-kingdom.png')}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='log' disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label hidden>Log</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='plus.circle.fill' md='add_circle' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='diary' disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label hidden>Diary</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf='book.pages' md='auto_stories' />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
