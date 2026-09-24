import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={{ default: colors.textSecondary, selected: colors.text }}
      labelVisibilityMode='unlabeled'
    >
      <NativeTabs.Trigger name='index' hidden />

      <NativeTabs.Trigger name='magic-kingdom'>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/magic-kingdom.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='epcot'>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/epcot.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='hollywood-studios'>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/hollywood-studios.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='animal-kingdom'>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/animal-kingdom.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
