import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';
import { usePathname, type Href } from 'expo-router';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { AppStateProvider, useAppState } from './app-state';

export default function AppTabs() {
  return (
    <AppStateProvider>
      <WebTabNavigator />
    </AppStateProvider>
  );
}

function WebTabNavigator() {
  const pathname = usePathname();
  const { tabBarHidden, setPreviousTabPath } = useAppState();

  useEffect(() => {
    if (pathname !== '/log') setPreviousTabPath(pathname);
  }, [pathname, setPreviousTabPath]);

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      {!tabBarHidden && (
        <TabList asChild>
          <CustomTabList>
            <TabTrigger name='index' href='/' asChild>
              <TabButton icon='confirmation_number' label='Rides' />
            </TabTrigger>
            <TabTrigger name='log' href={'/log' as Href} asChild>
              <TabButton icon='add_circle' label='Log' />
            </TabTrigger>
            <TabTrigger name='diary' href='/diary' asChild>
              <TabButton icon='book' label='Diary' />
            </TabTrigger>
          </CustomTabList>
        </TabList>
      )}
    </Tabs>
  );
}

export function TabButton({
  icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  icon: 'confirmation_number' | 'add_circle' | 'book';
  label: string;
}) {
  const colors = Colors.light;
  const isLogTab = label === 'Log';

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tabButtonView, pressed && styles.pressed]}
    >
      <SymbolView
        name={{ ios: 'ticket.fill', android: icon, web: icon }}
        size={isLogTab ? 44 : 24}
        tintColor={isLogTab || isFocused ? colors.accent : colors.textSecondary}
      />
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const colors = Colors.light;

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[styles.innerContainer, { backgroundColor: colors.background }]}
      >
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: 8,
    borderTopColor: '#dce7f2',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    alignItems: 'center',
    minWidth: 72,
    padding: 8,
  },
});
