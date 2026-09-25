import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideDetailsPanel } from '@/components/ride-details-panel';
import { RideListItem } from './ride-list-item';
import { BottomTabInset, Colors } from '@/constants/theme';
import { ParkLabels } from '@/constants/ride-labels';
import { seedRides } from '@/data/rides';
import { Park, Ride } from '@/models/ride';

type ParkScreenProps = {
  park: Park;
};

const panelWidth = Dimensions.get('window').width;
const parkTabs = [
  {
    park: Park.MagicKingdom,
    icon: require('@/assets/images/tabIcons/magic-kingdom.png'),
  },
  { park: Park.Epcot, icon: require('@/assets/images/tabIcons/epcot.png') },
  {
    park: Park.HollywoodStudios,
    icon: require('@/assets/images/tabIcons/hollywood-studios.png'),
  },
  {
    park: Park.AnimalKingdom,
    icon: require('@/assets/images/tabIcons/animal-kingdom.png'),
  },
];

export function ParkScreen({ park }: ParkScreenProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [selectedPark, setSelectedPark] = useState(park);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [panelPosition] = useState(() => new Animated.Value(panelWidth));
  const rides = seedRides
    .filter((ride) => ride.park === selectedPark)
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
    return <RideListItem ride={item} onPress={setSelectedRide} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.listViewport, { paddingTop: insets.top }]}>
        <View style={styles.parkHeader}>
          <View style={styles.parkTabs}>
            {parkTabs.map(({ park: parkOption, icon }) => (
              <Pressable
                key={parkOption}
                accessibilityRole='tab'
                accessibilityLabel={ParkLabels[parkOption]}
                accessibilityState={{ selected: parkOption === selectedPark }}
                onPress={() => setSelectedPark(parkOption)}
                style={[
                  styles.parkTab,
                  parkOption === selectedPark && styles.parkTabSelected,
                ]}
              >
                <Image
                  source={icon}
                  style={[
                    styles.parkIcon,
                    {
                      tintColor:
                        parkOption === selectedPark ? colors.accent : '#263d5a',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.parkTabLabel,
                    parkOption === selectedPark && styles.parkTabLabelSelected,
                  ]}
                >
                  {ParkLabels[parkOption]}
                </Text>
              </Pressable>
            ))}
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
          keyExtractor={(ride) => ride.id}
          renderItem={renderRide}
          scrollEventThrottle={16}
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
  parkHeader: {
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.background,
  },
  parkTabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  parkTab: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    height: 88,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  parkIcon: {
    width: 32,
    height: 32,
  },
  parkTabSelected: {
    borderBottomColor: Colors.light.accent,
  },
  parkTabLabel: {
    color: '#263d5a',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  parkTabLabelSelected: {
    color: Colors.light.accent,
  },
});
