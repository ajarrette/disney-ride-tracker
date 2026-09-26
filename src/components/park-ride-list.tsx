import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SymbolView } from 'expo-symbols';

import { RideListItem } from '@/components/ride-list-item';
import { BottomTabInset, Colors } from '@/constants/theme';
import { RideLiveData, normalizeRideName } from '@/data/live-wait-times';
import { Ride } from '@/models/ride';

type ParkRideListProps = {
  rides: Ride[];
  liveData?: Record<string, RideLiveData>;
  pinnedRideIds: Set<string>;
  pinnedRideOrder: string[];
  onPinnedRideOrderChange: (rideIds: string[]) => void;
  onRidePress: (ride: Ride) => void;
  isCatalogLoading: boolean;
  hasCatalogError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
};

export function ParkRideList({
  rides,
  liveData,
  pinnedRideIds,
  pinnedRideOrder,
  onPinnedRideOrderChange,
  onRidePress,
  isCatalogLoading,
  hasCatalogError,
  isRefreshing,
  onRefresh,
  bottomInset,
}: ParkRideListProps) {
  const colors = Colors.light;
  const rideOrder = new Map(
    pinnedRideOrder.map((rideId, index) => [rideId, index]),
  );
  const pinnedRides = rides
    .filter((ride) => pinnedRideIds.has(ride.id))
    .sort(
      (firstRide, secondRide) =>
        (rideOrder.get(firstRide.id) ?? Number.MAX_SAFE_INTEGER) -
          (rideOrder.get(secondRide.id) ?? Number.MAX_SAFE_INTEGER) ||
        firstRide.name.localeCompare(secondRide.name),
    );
  const unpinnedRides = rides
    .filter((ride) => !pinnedRideIds.has(ride.id))
    .sort((firstRide, secondRide) =>
      firstRide.name.localeCompare(secondRide.name),
    );

  const renderPinnedRide = ({
    item,
    getIndex,
    drag,
    isActive,
  }: {
    item: Ride;
    getIndex: () => number | undefined;
    drag: () => void;
    isActive: boolean;
  }) => {
    const index = getIndex() ?? 0;

    return (
      <RideListItem
        drag={drag}
        isDragging={isActive}
        isPinned
        isPinnedDivider={
          index === pinnedRides.length - 1 && unpinnedRides.length > 0
        }
        liveStatus={liveData?.[normalizeRideName(item.name)]}
        onPress={onRidePress}
        ride={item}
      />
    );
  };

  const updateParkPinnedRideOrder = (orderedParkRides: Ride[]) => {
    const parkPinnedIds = new Set(pinnedRides.map((ride) => ride.id));
    let nextParkIndex = 0;
    const nextOrder = pinnedRideOrder.map((rideId) =>
      parkPinnedIds.has(rideId)
        ? (orderedParkRides[nextParkIndex++]?.id ?? rideId)
        : rideId,
    );
    nextOrder.push(
      ...orderedParkRides.slice(nextParkIndex).map((ride) => ride.id),
    );
    onPinnedRideOrderChange(nextOrder);
  };

  const renderUnpinnedRides = () => (
    <View>
      {unpinnedRides.map((ride) => (
        <RideListItem
          key={ride.id}
          liveStatus={liveData?.[normalizeRideName(ride.name)]}
          onPress={onRidePress}
          ride={ride}
        />
      ))}
    </View>
  );

  return (
    <DraggableFlatList
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: bottomInset + BottomTabInset + 24 },
      ]}
      contentInsetAdjustmentBehavior='never'
      data={pinnedRides}
      extraData={{ liveData, pinnedRideIds, pinnedRideOrder }}
      keyExtractor={(ride) => ride.id}
      ListFooterComponent={renderUnpinnedRides}
      ListEmptyComponent={
        rides.length > 0 ? null : isCatalogLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : hasCatalogError ? (
          <Text
            style={[styles.catalogMessage, { color: colors.textSecondary }]}
          >
            Ride catalog unavailable. Check your connection and Supabase
            configuration.
          </Text>
        ) : null
      }
      onRefresh={onRefresh}
      onDragEnd={({ data }) => updateParkPinnedRideOrder(data)}
      renderItem={renderPinnedRide}
      renderPlaceholder={({ index }) => (
        <View style={styles.dropTarget}>
          <SymbolView
            name={{
              ios: 'arrow.down.to.line',
              android: 'vertical_align_bottom',
              web: 'vertical_align_bottom',
            }}
            size={16}
            tintColor={colors.accent}
          />
          <Text style={[styles.dropTargetText, { color: colors.accent }]}>
            Drop at position {index + 1}
          </Text>
        </View>
      )}
      refreshing={isRefreshing}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 24,
  },
  dropTarget: {
    alignItems: 'center',
    backgroundColor: '#eef7ff',
    borderColor: '#2589e8',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 6,
    minHeight: 76,
  },
  dropTargetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  catalogMessage: {
    lineHeight: 20,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
