import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';
import { LandLabels } from '@/constants/ride-labels';
import { RideLiveData } from '@/data/live-wait-times';
import { getRideLogo } from '@/data/ride-images';
import { Ride } from '@/models/ride';
import { RideLiveStatusLine } from './ride-live-status-line';

export function RideListItem({
  ride,
  isPinned = false,
  isPinnedDivider = false,
  isDragging = false,
  drag,
  liveStatus,
  onPress,
}: {
  ride: Ride;
  isPinned?: boolean;
  isPinnedDivider?: boolean;
  isDragging?: boolean;
  drag?: () => void;
  liveStatus?: RideLiveData;
  onPress: (ride: Ride) => void;
}) {
  const colors = Colors.light;
  const rideTextColor = '#263d5a';
  const logo = getRideLogo(ride.park, ride.logoUrl, ride.backgroundUrl);
  const isClosedStatus =
    liveStatus !== undefined &&
    ['DOWN', 'CLOSED', 'REFURBISHMENT'].includes(liveStatus.status);

  return (
    <Pressable
      accessibilityHint={
        isPinned ? 'Touch and hold to change the pinned ride order.' : undefined
      }
      accessibilityLabel={isPinned ? `${ride.name}, pinned` : ride.name}
      accessibilityRole='button'
      delayLongPress={180}
      disabled={isDragging}
      onLongPress={drag}
      onPress={() => onPress(ride)}
      style={({ pressed }) => [
        styles.rideRow,
        isPinnedDivider && styles.pinnedDivider,
        isDragging && styles.rideRowDragging,
        pressed && styles.rideRowPressed,
      ]}
    >
      <View
        style={[styles.rideLogo, { backgroundColor: colors.backgroundElement }]}
      >
        {logo && (
          <Image
            contentFit='cover'
            recyclingKey={ride.id}
            source={logo}
            style={styles.rideLogoImage}
          />
        )}
      </View>
      <View style={styles.rideCopy}>
        <Text style={[styles.rideName, { color: rideTextColor }]}>
          {ride.name}
        </Text>
        <Text style={[styles.rideLand, { color: rideTextColor }]}>
          {LandLabels[ride.land]}
        </Text>
        <RideLiveStatusLine
          color={isClosedStatus ? undefined : rideTextColor}
          liveStatus={liveStatus}
        />
      </View>
      <View accessibilityElementsHidden style={styles.rideIndicators}>
        {isPinned && (
          <SymbolView
            name={{ ios: 'pin.fill', android: 'push_pin', web: 'push_pin' }}
            size={20}
            tintColor='#2589e8'
          />
        )}
        {ride.photoPass && (
          <SymbolView
            name={{
              ios: 'camera.fill',
              android: 'photo_camera',
              web: 'photo_camera',
            }}
            size={20}
            tintColor={colors.textSecondary}
          />
        )}
        {ride.lightningLane && (
          <SymbolView
            name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
            size={20}
            tintColor={colors.textSecondary}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rideRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 76,
    paddingVertical: 14,
  },
  pinnedDivider: {
    borderBottomColor: Colors.light.accent,
    borderBottomWidth: 2,
  },
  rideRowDragging: {
    backgroundColor: '#eef7ff',
    borderColor: '#78baff',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#16324f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 10,
  },
  rideRowPressed: {
    opacity: 0.55,
  },
  rideLogo: {
    borderRadius: 28,
    height: 56,
    marginRight: 16,
    overflow: 'hidden',
    width: 56,
  },
  rideLogoImage: {
    height: '100%',
    width: '100%',
  },
  rideCopy: {
    flex: 1,
    paddingRight: 16,
  },
  rideName: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  rideLand: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  rideIndicators: {
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    minWidth: 24,
  },
});
