import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RideFavoriteMark } from '@/components/ride-favorite-mark';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { RideLiveData } from '@/data/live-wait-times';
import { getRideLogo } from '@/data/ride-images';
import { Ride } from '@/models/ride';
import { RideLiveStatusLine } from './ride-live-status-line';

export function RideListItem({
  ride,
  isPinned = false,
  isFavorite = false,
  isPinnedDivider = false,
  isHidden = false,
  isDragging = false,
  drag,
  liveStatus,
  reserveLiveStatusSpace = false,
  showPark = false,
  onPress,
}: {
  ride: Ride;
  isPinned?: boolean;
  isFavorite?: boolean;
  isPinnedDivider?: boolean;
  isHidden?: boolean;
  isDragging?: boolean;
  drag?: () => void;
  liveStatus?: RideLiveData;
  reserveLiveStatusSpace?: boolean;
  showPark?: boolean;
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
      accessibilityLabel={[
        ride.name,
        isPinned ? 'pinned' : null,
        isHidden ? 'hidden' : null,
      ]
        .filter(Boolean)
        .join(', ')}
      accessibilityRole='button'
      delayLongPress={180}
      disabled={isDragging}
      onLongPress={drag}
      onPress={() => onPress(ride)}
      style={({ pressed }) => [
        styles.rideRow,
        isPinnedDivider && styles.pinnedDivider,
        isHidden && styles.hiddenRide,
        isDragging && styles.rideRowDragging,
        pressed && styles.rideRowPressed,
      ]}
    >
      <View
        style={[
          styles.rideLogo,
          isPinned && styles.pinnedRideLogo,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        {logo && (
          <Image
            contentFit='cover'
            recyclingKey={ride.id}
            source={logo}
            style={styles.rideLogoImage}
          />
        )}
        {!logo && (
          <SymbolView
            name={{ ios: 'photo', android: 'image', web: 'image' }}
            size={20}
            tintColor={colors.textSecondary}
          />
        )}
      </View>
      <View style={styles.rideCopy}>
        <Text style={[styles.rideName, { color: rideTextColor }]}>
          {ride.name}
          <RideFavoriteMark isFavorite={isFavorite} />
        </Text>
        <View style={styles.rideMetadata}>
          <View style={styles.rideLandRow}>
            {showPark ? (
              <Text style={[styles.rideLand, { color: colors.textSecondary }]}>
                <Text style={styles.parkName}>{ParkLabels[ride.park]}</Text>
                {' - '}
                {LandLabels[ride.land]}
              </Text>
            ) : (
              <Text style={[styles.rideLand, { color: rideTextColor }]}>
                {LandLabels[ride.land]}
              </Text>
            )}
          </View>
          <View style={styles.rideWaitRow}>
            <RideLiveStatusLine
              color={isClosedStatus ? undefined : rideTextColor}
              liveStatus={liveStatus}
              reserveSpaceWhenEmpty={reserveLiveStatusSpace}
            />
          </View>
        </View>
      </View>
      {(ride.photoPass || ride.lightningLane) && (
        <View accessibilityElementsHidden style={styles.rideIndicators}>
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
              tintColor={colors.accent}
            />
          )}
        </View>
      )}
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
  hiddenRide: {
    opacity: 0.5,
  },
  rideLogo: {
    borderRadius: 28,
    height: 56,
    marginRight: 16,
    overflow: 'hidden',
    width: 56,
  },
  pinnedRideLogo: {
    borderColor: '#2589e8',
    borderWidth: 2,
  },
  rideLogoImage: {
    height: '100%',
    width: '100%',
  },
  rideCopy: {
    flex: 1,
  },
  rideName: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  rideLand: {
    fontSize: 13,
    lineHeight: 19,
  },
  parkName: {
    fontWeight: '600',
  },
  rideMetadata: {
    marginTop: 3,
  },
  rideLandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rideWaitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rideIndicators: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
  },
});
