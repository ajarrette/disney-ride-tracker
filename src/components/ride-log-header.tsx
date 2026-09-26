import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';

type RideLogHeaderProps = {
  hasBackground: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  isMutating: boolean;
  onClose: () => void;
  onDelete: () => void;
  scrollY: Animated.Value;
};

export function RideLogHeader({
  hasBackground,
  isDeleting,
  isEditing,
  isMutating,
  onClose,
  onDelete,
  scrollY,
}: RideLogHeaderProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const titleOpacity = scrollY.interpolate({
    inputRange: [140, 220],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const backgroundOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const foregroundOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.header,
        hasBackground && styles.headerOverlay,
        { height: 56 + insets.top, paddingTop: insets.top },
      ]}
    >
      {hasBackground && (
        <Animated.View
          pointerEvents='none'
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background, opacity: backgroundOpacity },
          ]}
        />
      )}
      <Pressable
        accessibilityLabel='Close ride form'
        accessibilityRole='button'
        disabled={isMutating}
        hitSlop={8}
        onPress={onClose}
        style={styles.headerAction}
      >
        {hasBackground ? (
          <>
            <Animated.View
              pointerEvents='none'
              style={[styles.headerForeground, { opacity: foregroundOpacity }]}
            >
              <SymbolView
                name={{
                  ios: 'xmark.circle.fill',
                  android: 'cancel',
                  web: 'cancel',
                }}
                size={24}
                tintColor='#ffffff'
              />
            </Animated.View>
            <Animated.View style={{ opacity: backgroundOpacity }}>
              <SymbolView
                name={{
                  ios: 'xmark.circle.fill',
                  android: 'cancel',
                  web: 'cancel',
                }}
                size={24}
                tintColor={colors.accent}
              />
            </Animated.View>
          </>
        ) : (
          <SymbolView
            name={{
              ios: 'xmark.circle.fill',
              android: 'cancel',
              web: 'cancel',
            }}
            size={24}
            tintColor={colors.accent}
          />
        )}
      </Pressable>
      {hasBackground ? (
        <Animated.Text
          numberOfLines={1}
          pointerEvents='none'
          style={[
            styles.collapsingHeaderTitle,
            {
              color: '#263d5a',
              opacity: titleOpacity,
              top: insets.top + 16,
            },
          ]}
        >
          Log a Ride
        </Animated.Text>
      ) : (
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Ride' : 'Log a Ride'}
        </Text>
      )}
      {isEditing ? (
        <Pressable
          accessibilityLabel='Delete ride log'
          accessibilityRole='button'
          accessibilityState={{ disabled: isMutating }}
          disabled={isMutating}
          hitSlop={8}
          onPress={onDelete}
          style={[styles.headerAction, styles.headerActionRight]}
        >
          {isDeleting ? (
            <ActivityIndicator color='#d92d20' size='small' />
          ) : hasBackground ? (
            <>
              <Animated.View
                style={[
                  styles.headerDeleteForeground,
                  { opacity: foregroundOpacity },
                ]}
              >
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={20}
                  tintColor='#ffffff'
                />
              </Animated.View>
              <Animated.View style={{ opacity: backgroundOpacity }}>
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={20}
                  tintColor='#d92d20'
                />
              </Animated.View>
            </>
          ) : (
            <SymbolView
              name={{ ios: 'trash', android: 'delete', web: 'delete' }}
              size={20}
              tintColor='#d92d20'
            />
          )}
        </Pressable>
      ) : (
        <View style={styles.headerAction} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerOverlay: {
    borderBottomWidth: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  headerAction: {
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    position: 'relative',
  },
  headerActionRight: {
    alignItems: 'flex-end',
  },
  headerForeground: {
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  headerDeleteForeground: {
    alignItems: 'flex-end',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  collapsingHeaderTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: '800',
    left: 84,
    lineHeight: 24,
    position: 'absolute',
    right: 84,
    textAlign: 'center',
  },
});
