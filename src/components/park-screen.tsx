import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/components/app-state';
import { ParkRideList } from '@/components/park-ride-list';
import { useResortPreferences } from '@/components/resort-preferences-provider';
import { useRideCatalog } from '@/components/ride-catalog-provider';
import { RideDetailsPanel } from '@/components/ride-details-panel';
import { useRidePreferences } from '@/components/ride-preferences-provider';
import { ResortOptions, ResortScopeId } from '@/constants/resorts';
import { ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { fetchParkLiveData, RideLiveData } from '@/data/live-wait-times';
import { Park, Ride } from '@/models/ride';

type ParkScreenProps = {
  park: Park;
};

const panelWidth = Dimensions.get('window').width;
const PARK_TAB_ORDER_STORAGE_KEY = 'park-tab-order:v1';
const SELECTED_PARK_STORAGE_KEY = 'selected-park:v1';
const SELECTED_PARKS_STORAGE_KEY = 'selected-parks-by-resort:v1';
const parkTabs: {
  park: Park;
  unselectedIcon?: ImageSource;
  selectedIcon?: ImageSource;
  placeholderLabel?: string;
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
  {
    park: Park.DisneylandPark,
    unselectedIcon: require('@/assets/images/disneyland-icon.png'),
    selectedIcon: require('@/assets/images/disneyland-selected-icon.png'),
  },
  {
    park: Park.DisneyCaliforniaAdventure,
    unselectedIcon: require('@/assets/images/california-adventure-icon.png'),
    selectedIcon: require('@/assets/images/california-adventure-selected-icon.png'),
  },
];
const getDefaultParkTabOrder = () => parkTabs.map(({ park }) => park);
const isPark = (value: unknown): value is Park =>
  parkTabs.some(({ park }) => park === value);
type SelectedParks = Record<ResortScopeId, Park>;

const readSelectedParks = (fallbackPark: Park): SelectedParks => {
  let savedParks: Record<string, unknown> = {};
  let legacyPark: unknown;
  try {
    const storedParks = Storage.getItemSync(SELECTED_PARKS_STORAGE_KEY);
    const parsedParks: unknown = storedParks ? JSON.parse(storedParks) : null;
    if (typeof parsedParks === 'object' && parsedParks !== null) {
      savedParks = parsedParks as Record<string, unknown>;
    }
    legacyPark = Storage.getItemSync(SELECTED_PARK_STORAGE_KEY);
  } catch {}

  return Object.fromEntries(
    ResortOptions.map((resort) => {
      const availableParks = getDefaultParkTabOrder().filter(
        (parkOption) => resort.parks === null || resort.parks.has(parkOption),
      );
      const savedPark = savedParks[resort.id];
      const selectedPark =
        isPark(savedPark) && availableParks.includes(savedPark)
          ? savedPark
          : resort.id === 'all' && isPark(legacyPark)
            ? legacyPark
            : resort.id === 'all' && availableParks.includes(fallbackPark)
              ? fallbackPark
              : availableParks[0];
      return [resort.id, selectedPark];
    }),
  ) as SelectedParks;
};
const saveSelectedParks = (selectedParks: SelectedParks) => {
  try {
    Storage.setItemSync(
      SELECTED_PARKS_STORAGE_KEY,
      JSON.stringify(selectedParks),
    );
  } catch {}
};
const getResortScope = (resortId: ResortScopeId) =>
  ResortOptions.find((resort) => resort.id === resortId) ?? ResortOptions[0];
const mergeVisibleParkOrder = (
  currentOrder: Park[],
  visibleParks: Park[],
  reorderedVisibleParks: Park[],
) => {
  let visibleIndex = 0;
  return currentOrder.map((parkOption) =>
    visibleParks.includes(parkOption)
      ? reorderedVisibleParks[visibleIndex++]
      : parkOption,
  );
};

const saveSelectedPark = (parkOption: Park) => {
  try {
    Storage.setItemSync(SELECTED_PARK_STORAGE_KEY, parkOption);
  } catch {}
};
const readParkTabOrder = () => {
  try {
    const storedOrder = Storage.getItemSync(PARK_TAB_ORDER_STORAGE_KEY);
    if (!storedOrder) return getDefaultParkTabOrder();

    const parsedOrder: unknown = JSON.parse(storedOrder);
    if (!Array.isArray(parsedOrder)) return getDefaultParkTabOrder();

    const savedParks = [...new Set(parsedOrder.filter(isPark))];
    return [
      ...savedParks,
      ...getDefaultParkTabOrder().filter(
        (parkOption) => !savedParks.includes(parkOption),
      ),
    ];
  } catch {
    return getDefaultParkTabOrder();
  }
};
const saveParkTabOrder = (order: Park[]) => {
  try {
    Storage.setItemSync(PARK_TAB_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {}
};
const parkSelectionColors: Partial<Record<Park, string>> = {
  [Park.MagicKingdom]: '#4CA1D4',
  [Park.Epcot]: '#766FB0',
  [Park.HollywoodStudios]: '#9C5D32',
  [Park.AnimalKingdom]: '#78AE70',
  [Park.DisneylandPark]: '#CD93AA',
  [Park.DisneyCaliforniaAdventure]: '#619EC3',
};

export function ParkScreen({ park }: ParkScreenProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const parkTabWidth = windowWidth / 4;
  const [parkTabOrder, setParkTabOrder] = useState(readParkTabOrder);
  const { selectedResortId } = useResortPreferences();
  const selectedResort = getResortScope(selectedResortId);
  const visibleParks = parkTabOrder.filter(
    (parkOption) =>
      selectedResort.parks === null || selectedResort.parks.has(parkOption),
  );
  const [selectedParksByResort, setSelectedParksByResort] = useState(() =>
    readSelectedParks(park),
  );
  const selectedPark = selectedParksByResort[selectedResortId];
  const { rideLogs, rideLogsReady, setRideDetailsOpen } = useAppState();
  const {
    rides: catalogRides,
    isLoading,
    isRefreshing: isCatalogRefreshing,
    hasError,
    refreshCatalog,
  } = useRideCatalog();
  const {
    pinnedRideIds,
    pinnedRideOrder,
    favoriteRideIds,
    rideRatings,
    hiddenRideIds,
    isLoading: isPreferencesLoading,
    setRidePinned,
    setPinnedRideOrder,
    setRideFavorite,
    setRideRating,
    setRideHidden,
  } = useRidePreferences();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [panelPosition] = useState(() => new Animated.Value(panelWidth));
  const [liveDataByPark, setLiveDataByPark] = useState<
    Partial<Record<Park, Record<string, RideLiveData>>>
  >({});
  const [loadingParks, setLoadingParks] = useState<Set<Park>>(() => new Set());
  const loadedParks = useRef(new Set<Park>());
  const pendingParks = useRef(new Set<Park>());
  const loadLiveData = useCallback(
    async (parkToLoad: Park, catalog = catalogRides) => {
      if (pendingParks.current.has(parkToLoad)) {
        return;
      }

      pendingParks.current.add(parkToLoad);
      setLoadingParks((current) => new Set(current).add(parkToLoad));

      try {
        const liveData = await fetchParkLiveData(
          parkToLoad,
          catalog.filter((ride) => ride.park === parkToLoad && ride.isActive),
        );
        setLiveDataByPark((current) => ({
          ...current,
          [parkToLoad]: liveData,
        }));
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
    },
    [catalogRides],
  );

  useEffect(() => {
    if (!isLoading && !loadedParks.current.has(selectedPark)) {
      void loadLiveData(selectedPark);
    }
  }, [isLoading, loadLiveData, selectedPark]);

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

  const refreshSelectedPark = async () => {
    const freshCatalog = await refreshCatalog();
    await loadLiveData(selectedPark, freshCatalog ?? catalogRides);
  };
  const selectPark = (parkOption: Park) => {
    const nextSelectedParks = {
      ...selectedParksByResort,
      [selectedResortId]: parkOption,
    };
    setSelectedParksByResort(nextSelectedParks);
    saveSelectedParks(nextSelectedParks);
    if (selectedResortId === 'all') saveSelectedPark(parkOption);
  };
  const reorderVisibleParks = (reorderedVisibleParks: Park[]) => {
    const nextOrder = mergeVisibleParkOrder(
      parkTabOrder,
      visibleParks,
      reorderedVisibleParks,
    );
    setParkTabOrder(nextOrder);
    saveParkTabOrder(nextOrder);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.listViewport, { paddingTop: insets.top }]}>
        <View style={styles.parkHeader}>
          <View style={styles.parkNavigation}>
            <DraggableFlatList
              contentContainerStyle={styles.parkTabs}
              data={visibleParks}
              horizontal
              keyExtractor={(parkOption) => parkOption}
              onDragEnd={({ data }) => reorderVisibleParks(data)}
              autoscrollThreshold={48}
              autoscrollSpeed={120}
              renderItem={({ item: parkOption, drag, isActive }) => {
                const { unselectedIcon, selectedIcon, placeholderLabel } =
                  parkTabs.find((tab) => tab.park === parkOption)!;

                return (
                  <Pressable
                    accessibilityHint='Touch and hold to rearrange parks.'
                    accessibilityRole='tab'
                    accessibilityLabel={ParkLabels[parkOption]}
                    accessibilityState={{
                      selected: parkOption === selectedPark,
                    }}
                    delayLongPress={180}
                    disabled={isActive}
                    onLongPress={drag}
                    onPress={() => selectPark(parkOption)}
                    style={[
                      styles.parkTab,
                      { width: parkTabWidth },
                      isActive && styles.parkTabDragging,
                      parkOption === selectedPark && {
                        borderBottomColor:
                          parkSelectionColors[parkOption] ?? colors.accent,
                      },
                    ]}
                  >
                    {unselectedIcon ? (
                      <Image
                        source={
                          parkOption === selectedPark
                            ? (selectedIcon ?? unselectedIcon)
                            : unselectedIcon
                        }
                        style={styles.parkIcon}
                      />
                    ) : (
                      <View style={styles.parkPlaceholder}>
                        <Text style={styles.parkPlaceholderLabel}>
                          {placeholderLabel}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              }}
              renderPlaceholder={() => (
                <View
                  style={[
                    styles.parkTab,
                    { width: parkTabWidth },
                    styles.parkTabDropTarget,
                  ]}
                />
              )}
              showsHorizontalScrollIndicator={false}
              style={[styles.parkTabList, { width: windowWidth }]}
            />
          </View>
        </View>
        <ParkRideList
          bottomInset={insets.bottom}
          hasCatalogError={hasError}
          isCatalogLoading={isLoading}
          isPreferencesLoading={isPreferencesLoading}
          isRefreshing={loadingParks.has(selectedPark) || isCatalogRefreshing}
          liveData={liveDataByPark[selectedPark]}
          favoriteRideIds={favoriteRideIds}
          onPinnedRideOrderChange={setPinnedRideOrder}
          onRefresh={refreshSelectedPark}
          onRidePress={openRide}
          pinnedRideIds={pinnedRideIds}
          pinnedRideOrder={pinnedRideOrder}
          hiddenRideIds={hiddenRideIds}
          rides={catalogRides.filter(
            (ride) => ride.park === selectedPark && ride.isActive,
          )}
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
          onViewRideLogs={() =>
            router.push({
              pathname: '/diary',
              params: { rideId: selectedRide.id, tripId: undefined },
            })
          }
          isPinned={pinnedRideIds.has(selectedRide.id)}
          onTogglePin={(isPinned) => setRidePinned(selectedRide.id, isPinned)}
          isFavorite={favoriteRideIds.has(selectedRide.id)}
          onToggleFavorite={(isFavorite) =>
            setRideFavorite(selectedRide.id, isFavorite)
          }
          isHidden={hiddenRideIds.has(selectedRide.id)}
          onToggleHidden={(isHidden) =>
            setRideHidden(selectedRide.id, isHidden)
          }
          panelPosition={panelPosition}
          ride={selectedRide}
          rideCount={
            rideLogsReady
              ? rideLogs.filter((log) => log.rideId === selectedRide.id).length
              : null
          }
          rating={rideRatings.get(selectedRide.id) ?? null}
          onChangeRating={(rating) => setRideRating(selectedRide.id, rating)}
          liveStatus={liveDataByPark[selectedPark]?.[selectedRide.id]}
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
  parkHeader: {
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.background,
  },
  parkNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  parkTabList: {
    flexGrow: 0,
    flexShrink: 0,
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
    minWidth: '100%',
  },
  parkTab: {
    alignItems: 'center',
    flexShrink: 0,
    height: 80,
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  parkTabDragging: {
    opacity: 0.65,
  },
  parkTabDropTarget: {
    borderColor: '#8393A1',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 64,
    marginHorizontal: 8,
  },
  parkIcon: {
    width: 64,
    height: 64,
  },
  parkPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#E7EBEF',
    borderRadius: 4,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  parkPlaceholderLabel: {
    color: '#637384',
    fontSize: 12,
    fontWeight: '600',
  },
});
