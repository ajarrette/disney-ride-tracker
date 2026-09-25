import { Image } from 'expo-image';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { LandLabels } from '@/constants/ride-labels';
import { getRideBackground } from '@/data/ride-images';
import { Ride } from '@/models/ride';

type RideDetailsPanelProps = {
  onBack: () => void;
  panelPosition: Animated.Value;
  ride: Ride;
};

export function RideDetailsPanel({
  onBack,
  panelPosition,
  ride,
}: RideDetailsPanelProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const background = getRideBackground(ride.park, ride.backgroundUrl);

  return (
    <Animated.View
      style={[
        styles.detailPanel,
        {
          backgroundColor: colors.background,
          transform: [{ translateX: panelPosition }],
        },
      ]}
    >
      {background && (
        <View style={styles.detailHero}>
          <Image
            contentFit='cover'
            source={background}
            style={styles.detailHeroImage}
          />
          <View style={styles.detailHeroScrim} />
        </View>
      )}
      <View
        style={[
          styles.detailHeader,
          { paddingTop: insets.top },
          background && styles.detailHeaderOverImage,
        ]}
      >
        <Pressable
          accessibilityLabel='Back to ride list'
          accessibilityRole='button'
          hitSlop={12}
          onPress={onBack}
          style={[styles.backButton, background && styles.backButtonOverImage]}
        >
          <Text
            style={[
              styles.backIcon,
              { color: background ? '#ffffff' : colors.text },
            ]}
          >
            ←
          </Text>
        </Pressable>
      </View>
      <View style={styles.detailContent}>
        <Text style={[styles.detailName, { color: colors.text }]}>
          {ride.name}
        </Text>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          LAND
        </Text>
        <Text style={[styles.detailLand, { color: colors.text }]}>
          {LandLabels[ride.land]}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  detailPanel: {
    ...StyleSheet.absoluteFill,
  },
  detailHero: {
    height: 280,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  detailHeroImage: {
    height: '100%',
    width: '100%',
  },
  detailHeroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 24,
  },
  detailHeaderOverImage: {
    alignItems: 'flex-start',
    height: 280,
    justifyContent: 'flex-start',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonOverImage: {
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    borderRadius: 20,
    transform: [{ translateY: -8 }],
  },
  backIcon: {
    fontSize: 30,
    lineHeight: 34,
  },
  detailContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  detailName: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 40,
  },
  detailLand: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
});
