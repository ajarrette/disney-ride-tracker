import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';
import { LandLabels } from '@/constants/ride-labels';
import { getRideLogo } from '@/data/ride-images';
import { Ride } from '@/models/ride';

export function RideListItem({
  ride,
  onPress,
}: {
  ride: Ride;
  onPress: (ride: Ride) => void;
}) {
  const colors = Colors.light;
  const logo = getRideLogo(ride.park, ride.logoUrl, ride.backgroundUrl);

  return (
    <Pressable
      accessibilityRole='button'
      onPress={() => onPress(ride)}
      style={({ pressed }) => [
        styles.rideRow,
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
        <Text style={[styles.rideName, { color: colors.text }]}>
          {ride.name}
        </Text>
        <Text style={[styles.rideLand, { color: colors.textSecondary }]}>
          {LandLabels[ride.land]}
        </Text>
      </View>
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
