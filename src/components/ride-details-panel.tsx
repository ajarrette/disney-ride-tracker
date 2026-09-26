import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { RideLiveData } from '@/data/live-wait-times';
import { getRideBackground } from '@/data/ride-images';
import { Ride } from '@/models/ride';
import { RideLiveStatusLine } from './ride-live-status-line';

const formatLabel = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const formatHeightRequirement = (
  minimum: number | null,
  maximum: number | null,
) => {
  if (minimum === null && maximum === null) return 'Any Height';
  if (minimum !== null && maximum !== null) {
    return `${minimum}-${maximum}"`;
  }
  if (minimum !== null) return `${minimum}" and taller`;
  return `Up to ${maximum}"`;
};

const rideTitleColor = '#263d5a';

type RideDetailsPanelProps = {
  onBack: () => void;
  onLogRide: () => void;
  panelPosition: Animated.Value;
  ride: Ride;
  liveStatus?: RideLiveData;
};

export function RideDetailsPanel({
  onBack,
  onLogRide,
  panelPosition,
  ride,
  liveStatus,
}: RideDetailsPanelProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const background = getRideBackground(ride.park, ride.backgroundUrl);
  const [scrollY] = useState(() => new Animated.Value(0));
  const titleCollapseOffset = background ? 220 : 56;
  const titleFadeStart = Math.max(0, titleCollapseOffset - 80);
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [titleFadeStart, titleCollapseOffset],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [titleFadeStart, titleCollapseOffset],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const whiteBackIconOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const blueBackIconOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const details = [
    [
      'HEIGHT REQUIREMENT',
      formatHeightRequirement(
        ride.minimumHeightInches,
        ride.maximumHeightInches,
      ),
    ],
    ['AGES', ride.ages.map(formatLabel).join(', ')],
    [
      'THRILL TYPE',
      ride.thrillTypes.length > 0
        ? ride.thrillTypes.map(formatLabel).join(', ')
        : null,
    ],
    [
      'DURATION',
      ride.durationMinutes === null ? null : `${ride.durationMinutes} minutes`,
    ],
    ['ATTRACTION TYPE', formatLabel(ride.attractionType)],
    [
      'WARNINGS',
      ride.warnings.length > 0
        ? ride.warnings.map(formatLabel).join(', ')
        : null,
    ],
    [
      'ACCESSIBILITY',
      ride.accessibility.length > 0
        ? ride.accessibility.map(formatLabel).join(', ')
        : null,
    ],
  ] as const;

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
      <Animated.View
        style={[styles.detailHeader, { top: insets.top }]}
        pointerEvents='box-none'
      >
        <Animated.View
          pointerEvents='none'
          style={[
            styles.headerBackground,
            {
              backgroundColor: colors.background,
              opacity: background ? headerBackgroundOpacity : 1,
            },
          ]}
        />
        <Pressable
          accessibilityLabel='Back to ride list'
          accessibilityRole='button'
          hitSlop={12}
          onPress={onBack}
          style={styles.backButton}
        >
          <Animated.Text
            style={[
              styles.backIcon,
              { opacity: background ? whiteBackIconOpacity : 0 },
            ]}
          >
            ‹
          </Animated.Text>
          <Animated.Text
            style={[
              styles.backIcon,
              styles.backIconOverlay,
              {
                color: colors.accent,
                opacity: background ? blueBackIconOpacity : 1,
              },
            ]}
          >
            ‹
          </Animated.Text>
        </Pressable>
        <Animated.Text
          numberOfLines={1}
          pointerEvents='none'
          style={[
            styles.headerTitle,
            { color: rideTitleColor, opacity: headerTitleOpacity },
          ]}
        >
          {ride.name}
        </Animated.Text>
      </Animated.View>
      <Animated.ScrollView
        contentContainerStyle={styles.detailContent}
        style={styles.detailScroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: insets.top }} />
        {background && (
          <Image
            contentFit='cover'
            source={background}
            style={styles.detailHeroImage}
          />
        )}
        {!background && <View style={styles.heroPlaceholder} />}
        <Animated.View
          style={[styles.rideSummary, { opacity: largeTitleOpacity }]}
        >
          <View style={styles.rideTitleRow}>
            <Text style={[styles.rideName, { color: rideTitleColor }]}>
              {ride.name}
            </Text>
            <Pressable
              accessibilityLabel={`Log ${ride.name}`}
              accessibilityRole='button'
              hitSlop={8}
              onPress={onLogRide}
              style={styles.logRideButton}
            >
              <SymbolView
                name={{
                  ios: 'plus.circle.fill',
                  android: 'add_circle',
                  web: 'add_circle',
                }}
                size={30}
                tintColor={colors.accent}
              />
            </Pressable>
          </View>
          <Text style={[styles.ridePark, { color: colors.textSecondary }]}>
            {ParkLabels[ride.park]}
          </Text>
          <Text style={[styles.rideLand, { color: colors.textSecondary }]}>
            {LandLabels[ride.land]}
          </Text>
          <RideLiveStatusLine liveStatus={liveStatus} />
        </Animated.View>
        <View style={styles.featureSection}>
          <Text style={styles.featureIcon}>ϟ</Text>
          <Text style={[styles.featureTitle, { color: colors.text }]}>
            Lightning Lane
          </Text>
          <Text style={[styles.featureValue, { color: colors.textSecondary }]}>
            {ride.lightningLane ? 'Available' : 'Not offered'}
          </Text>
        </View>
        {details.map(([label, value]) =>
          value ? (
            <View key={label} style={styles.detailSection}>
              <Text
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                {label}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          ) : null,
        )}
        <View style={styles.detailSection}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            ABOUT THIS ATTRACTION
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {ride.description}
          </Text>
        </View>
        {(ride.photoPass || ride.seasonal) && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              FEATURES
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {[
                ride.photoPass ? 'PhotoPass' : null,
                ride.seasonal ? 'Seasonal' : null,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        )}
      </Animated.ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  detailPanel: {
    ...StyleSheet.absoluteFill,
  },
  detailHeader: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  headerBackground: {
    ...StyleSheet.absoluteFill,
  },
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    left: 12,
    position: 'absolute',
    top: 4,
    width: 48,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 46,
    position: 'absolute',
  },
  backIconOverlay: {
    color: Colors.light.accent,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    fontWeight: '800',
    left: 60,
    position: 'absolute',
    right: 60,
    textAlign: 'center',
  },
  detailContent: {
    paddingBottom: 32,
  },
  detailScroll: {
    flex: 1,
  },
  detailHeroImage: {
    height: 220,
    width: '100%',
  },
  heroPlaceholder: {
    height: 56,
  },
  rideSummary: {
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 20,
  },
  rideName: {
    flex: 1,
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  rideTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logRideButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  ridePark: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 6,
  },
  rideLand: {
    fontSize: 16,
    lineHeight: 22,
  },
  featureSection: {
    alignItems: 'center',
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 156,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  featureIcon: {
    color: Colors.light.accent,
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 60,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  featureValue: {
    fontSize: 14,
    marginTop: 6,
  },
  detailSection: {
    alignItems: 'center',
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 108,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
    textAlign: 'center',
  },
});
