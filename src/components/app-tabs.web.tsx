import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Image } from 'expo-image';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name='index' href='/' style={{ display: 'none' }} />

          <TabTrigger name='magic-kingdom' href='/magic-kingdom' asChild>
            <TabButton
              icon={require('@/assets/images/tabIcons/magic-kingdom.png')}
              accessibilityLabel='Magic Kingdom'
            />
          </TabTrigger>
          <TabTrigger name='epcot' href='/epcot' asChild>
            <TabButton
              icon={require('@/assets/images/tabIcons/epcot.png')}
              accessibilityLabel='EPCOT'
            />
          </TabTrigger>
          <TabTrigger
            name='hollywood-studios'
            href='/hollywood-studios'
            asChild
          >
            <TabButton
              icon={require('@/assets/images/tabIcons/hollywood-studios.png')}
              accessibilityLabel='Hollywood Studios'
            />
          </TabTrigger>
          <TabTrigger name='animal-kingdom' href='/animal-kingdom' asChild>
            <TabButton
              icon={require('@/assets/images/tabIcons/animal-kingdom.png')}
              accessibilityLabel='Animal Kingdom'
            />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: number }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          {
            backgroundColor: isFocused
              ? colors.backgroundSelected
              : colors.backgroundElement,
          },
        ]}
      >
        <Image
          source={icon}
          style={[
            styles.icon,
            { tintColor: isFocused ? colors.accent : colors.textSecondary },
          ]}
        />
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    padding: Spacing.two,
    borderRadius: Spacing.three,
  },
  icon: {
    width: 25,
    height: 25,
  },
});
