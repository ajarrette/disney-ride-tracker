import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { RideDetailsPanel } from '@/components/ride-details-panel';
import { BottomTabInset, Colors, Fonts } from '@/constants/theme';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { getParkImage } from '@/data/park-images';
import { getRideLogo } from '@/data/ride-images';
import { seedRides } from '@/data/rides';
import { Park, Ride } from '@/models/ride';

type ParkScreenProps = {
  park: Park;
};

const panelWidth = Dimensions.get('window').width;

export function ParkScreen({ park }: ParkScreenProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const parkImage = getParkImage(park);
  const [scrollY] = useState(() => new Animated.Value(0));
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [panelPosition] = useState(() => new Animated.Value(panelWidth));
  const titleCollapseOffset = 220;
  const titleFadeStart = titleCollapseOffset - 80;
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [titleFadeStart, titleCollapseOffset],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const rides = seedRides
    .filter((ride) => ride.park === park)
    .sort((firstRide, secondRide) =>
      firstRide.name.localeCompare(secondRide.name),
    );

  useEffect(() => {
    if (selectedRide) {
      panelPosition.setValue(panelWidth);
      Animated.timing(panelPosition, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [panelPosition, selectedRide]);

  const closePanel = () => {
    Animated.timing(panelPosition, {
      toValue: panelWidth,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSelectedRide(null);
      }
    });
  };

  const renderRide = ({ item }: { item: Ride }) => {
    const logo = getRideLogo(item.park, item.logoUrl, item.backgroundUrl);

    return (
      <Pressable
        accessibilityRole='button'
        onPress={() => setSelectedRide(item)}
        style={({ pressed }) => [
          styles.rideRow,
          pressed && styles.rideRowPressed,
        ]}
      >
        <View
          style={[
            styles.rideLogo,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          {logo && (
            <Image
              contentFit='cover'
              recyclingKey={item.id}
              source={logo}
              style={styles.rideLogoImage}
            />
          )}
        </View>
        <View style={styles.rideCopy}>
          <Text style={[styles.rideName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.rideLand, { color: colors.textSecondary }]}>
            {LandLabels[item.land]}
          </Text>
        </View>
        <View accessibilityElementsHidden style={styles.rideIndicators}>
          {item.photoPass && (
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
          {item.lightningLane && (
            <SymbolView
              name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
              size={20}
              tintColor={colors.textSecondary}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.listViewport, { paddingTop: insets.top }]}>
        <Animated.FlatList
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + BottomTabInset + 24,
            },
          ]}
          contentInsetAdjustmentBehavior='never'
          data={rides}
          keyExtractor={(ride) => ride.id}
          ListHeaderComponent={
            <View>
              <View style={styles.parkHero}>
                <Image
                  accessibilityLabel={parkImage.alt}
                  contentFit='cover'
                  source={parkImage.source}
                  style={styles.parkHeroImage}
                />
              </View>
            </View>
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: Platform.OS !== 'web' },
          )}
          renderItem={renderRide}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
        <Animated.View style={[styles.detailHeader, { top: insets.top }]}>
          <Animated.View
            style={[
              styles.headerBackground,
              {
                backgroundColor: colors.background,
                opacity: headerBackgroundOpacity,
              },
            ]}
          />
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.headerTitle,
              { color: colors.text, opacity: headerTitleOpacity },
            ]}
          >
            {ParkLabels[park]}
          </Animated.Text>
        </Animated.View>
      </View>

      {selectedRide && (
        <RideDetailsPanel
          onBack={closePanel}
          panelPosition={panelPosition}
          ride={selectedRide}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listViewport: {
    flex: 1,
  },
  listContent: {
    padding: 24,
  },
  parkHero: {
    height: 220,
    marginHorizontal: -24,
  },
  parkHeroImage: {
    height: '100%',
    width: '100%',
  },
  detailHeader: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  headerBackground: {
    ...StyleSheet.absoluteFill,
    borderBottomColor: Colors.light.backgroundSelected,
    borderBottomWidth: StyleSheet.hairlineWidth,
    pointerEvents: 'none',
  },
  headerTitle: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '600',
    left: 20,
    pointerEvents: 'none',
    position: 'absolute',
    right: 20,
    textAlign: 'center',
  },
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
