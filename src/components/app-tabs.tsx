import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={{ default: colors.textSecondary, selected: colors.accent }}
      labelVisibilityMode='unlabeled'
    >
      <NativeTabs.Trigger name='index' hidden />

      <NativeTabs.Trigger name='magic-kingdom' disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/magic-kingdom.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='epcot' disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/epcot.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name='hollywood-studios'
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/hollywood-studios.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='animal-kingdom' disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/animal-kingdom.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
