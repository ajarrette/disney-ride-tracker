import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideDetailsPanel } from '@/components/ride-details-panel';
import { BottomTabInset, Colors } from '@/constants/theme';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
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
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [panelPosition] = useState(() => new Animated.Value(panelWidth));
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
    const logo = getRideLogo(item.park, item.logoUrl);

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
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.listViewport, { paddingTop: insets.top }]}>
        <FlatList
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
            <Text style={[styles.title, { color: colors.text }]}>
              {ParkLabels[park]}
            </Text>
          }
          renderItem={renderRide}
          showsVerticalScrollIndicator={false}
        />
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
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 24,
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
  chevron: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
