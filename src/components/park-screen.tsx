import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, type ImageSource } from 'expo-image';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideDetailsPanel } from '@/components/ride-details-panel';
import { useAppState } from '@/components/app-state';
import { RideListItem } from './ride-list-item';
import { BottomTabInset, Colors } from '@/constants/theme';
import { ParkLabels } from '@/constants/ride-labels';
import {
  fetchParkLiveData,
  normalizeRideName,
  RideLiveData,
} from '@/data/live-wait-times';
import { seedRides } from '@/data/rides';
import { Park, Ride } from '@/models/ride';

type ParkScreenProps = {
  park: Park;
};

const panelWidth = Dimensions.get('window').width;
const parkTabs: {
  park: Park;
  unselectedIcon: ImageSource;
  selectedIcon?: ImageSource;
}[] = [
  {
    park: Park.MagicKingdom,
    unselectedIcon: require('@/assets/images/magic-kingdom-icon.png'),
    selectedIcon: require('@/assets/images/magic-kingdom-selected-icon.png'),
  },
  {
    park: Park.Epcot,
    unselectedIcon: require('@/assets/images/epcot-icon.png'),
    selectedIcon: require('@/assets/images/epcot-selected-icon.png'),
  },
  {
    park: Park.HollywoodStudios,
    unselectedIcon: require('@/assets/images/hollywood-studios-icon.png'),
    selectedIcon: require('@/assets/images/hollywood-studios-selected-icon.png'),
  },
  {
    park: Park.AnimalKingdom,
    unselectedIcon: require('@/assets/images/animal-kingdom-icon.png'),
    selectedIcon: require('@/assets/images/animal-kingdom-selected-icon.png'),
  },
];
const parkSelectionColors: Partial<Record<Park, string>> = {
  [Park.MagicKingdom]: '#4CA1D4',
  [Park.Epcot]: '#766FB0',
  [Park.HollywoodStudios]: '#9C5D32',
  [Park.AnimalKingdom]: '#78AE70',
};

export function ParkScreen({ park }: ParkScreenProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { setRideDetailsOpen } = useAppState();
  const [selectedPark, setSelectedPark] = useState(park);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [panelPosition] = useState(() => new Animated.Value(panelWidth));
  const [liveDataByPark, setLiveDataByPark] = useState<
    Partial<Record<Park, Record<string, RideLiveData>>>
  >({});
  const [loadingParks, setLoadingParks] = useState<Set<Park>>(() => new Set());
  const loadedParks = useRef(new Set<Park>());
  const pendingParks = useRef(new Set<Park>());
  const rides = seedRides
    .filter((ride) => ride.park === selectedPark)
    .sort((firstRide, secondRide) =>
      firstRide.name.localeCompare(secondRide.name),
    );

  const loadLiveData = useCallback(async (parkToLoad: Park) => {
    if (pendingParks.current.has(parkToLoad)) {
      return;
    }

    pendingParks.current.add(parkToLoad);
    setLoadingParks((current) => new Set(current).add(parkToLoad));

    try {
      const liveData = await fetchParkLiveData(parkToLoad);
      setLiveDataByPark((current) => ({ ...current, [parkToLoad]: liveData }));
      loadedParks.current.add(parkToLoad);
    } catch (error) {
      console.warn(
        `Unable to load ${ParkLabels[parkToLoad]} live data.`,
        error,
      );
    } finally {
      pendingParks.current.delete(parkToLoad);
      setLoadingParks((current) => {
        const next = new Set(current);
        next.delete(parkToLoad);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (!loadedParks.current.has(selectedPark)) {
      void loadLiveData(selectedPark);
    }
  }, [loadLiveData, selectedPark]);

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
        setRideDetailsOpen(false);
        setSelectedRide(null);
      }
    });
  };

  const openRide = (ride: Ride) => {
    setRideDetailsOpen(true);
    setSelectedRide(ride);
  };

  const renderRide = ({ item }: { item: Ride }) => {
    const liveStatus =
      liveDataByPark[selectedPark]?.[normalizeRideName(item.name)];

    return (
      <RideListItem liveStatus={liveStatus} onPress={openRide} ride={item} />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.listViewport, { paddingTop: insets.top }]}>
        <View style={styles.parkHeader}>
          <View style={styles.parkTabs}>
            {parkTabs.map(
              ({ park: parkOption, unselectedIcon, selectedIcon }) => (
                <Pressable
                  key={parkOption}
                  accessibilityRole='tab'
                  accessibilityLabel={ParkLabels[parkOption]}
                  accessibilityState={{ selected: parkOption === selectedPark }}
                  onPress={() => setSelectedPark(parkOption)}
                  style={[
                    styles.parkTab,
                    parkOption === selectedPark && {
                      borderBottomColor:
                        parkSelectionColors[parkOption] ?? colors.accent,
                    },
                  ]}
                >
                  <Image
                    source={
                      parkOption === selectedPark
                        ? (selectedIcon ?? unselectedIcon)
                        : unselectedIcon
                    }
                    style={styles.parkIcon}
                  />
                </Pressable>
              ),
            )}
          </View>
        </View>
        <Animated.FlatList
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + BottomTabInset + 24,
            },
          ]}
          contentInsetAdjustmentBehavior='never'
          data={rides}
          extraData={liveDataByPark[selectedPark]}
          keyExtractor={(ride) => ride.id}
          onRefresh={() => loadLiveData(selectedPark)}
          renderItem={renderRide}
          refreshing={loadingParks.has(selectedPark)}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {selectedRide && (
        <RideDetailsPanel
          onBack={closePanel}
          onLogRide={() =>
            router.push({
              pathname: '/log',
              params: { rideId: selectedRide.id },
            })
          }
          panelPosition={panelPosition}
          ride={selectedRide}
          liveStatus={
            liveDataByPark[selectedPark]?.[normalizeRideName(selectedRide.name)]
          }
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
  parkHeader: {
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.background,
  },
  dataAttribution: {
    color: Colors.light.textSecondary,
    fontSize: 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
    textAlign: 'right',
  },
  parkTabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  parkTab: {
    alignItems: 'center',
    flex: 1,
    height: 64,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  parkIcon: {
    width: 48,
    height: 48,
  },
});
