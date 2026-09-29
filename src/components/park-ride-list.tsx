import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { RefreshControl } from 'react-native-gesture-handler';

import { RideListItem } from '@/components/ride-list-item';
import { BottomTabInset, Colors } from '@/constants/theme';
import { RideLiveData, normalizeRideName } from '@/data/live-wait-times';
import { Ride } from '@/models/ride';

function compareRideNames(firstRide: Ride, secondRide: Ride) {
  const firstName = firstRide.name.replace(/^(?:a|an|the)\s+/i, '');
  const secondName = secondRide.name.replace(/^(?:a|an|the)\s+/i, '');

  return firstName.localeCompare(secondName);
}

type ParkRideListProps = {
  rides: Ride[];
  liveData?: Record<string, RideLiveData>;
  pinnedRideIds: Set<string>;
  favoriteRideIds: Set<string>;
  pinnedRideOrder: string[];
  hiddenRideIds: Set<string>;
  onPinnedRideOrderChange: (rideIds: string[]) => void;
  onRidePress: (ride: Ride) => void;
  isCatalogLoading: boolean;
  isPreferencesLoading: boolean;
  hasCatalogError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
};

export function ParkRideList({
  rides,
  liveData,
  pinnedRideIds,
  favoriteRideIds,
  pinnedRideOrder,
  hiddenRideIds,
  onPinnedRideOrderChange,
  onRidePress,
  isCatalogLoading,
  isPreferencesLoading,
  hasCatalogError,
  isRefreshing,
  onRefresh,
  bottomInset,
}: ParkRideListProps) {
  const colors = Colors.light;
  const [showHiddenRides, setShowHiddenRides] = useState(false);
  const hiddenRides = rides
    .filter((ride) => hiddenRideIds.has(ride.id))
    .sort(compareRideNames);
  const visibleRides = rides.filter((ride) => !hiddenRideIds.has(ride.id));
  const rideOrder = new Map(
    pinnedRideOrder.map((rideId, index) => [rideId, index]),
  );
  const pinnedRides = visibleRides
    .filter((ride) => pinnedRideIds.has(ride.id))
    .sort(
      (firstRide, secondRide) =>
        (rideOrder.get(firstRide.id) ?? Number.MAX_SAFE_INTEGER) -
          (rideOrder.get(secondRide.id) ?? Number.MAX_SAFE_INTEGER) ||
        compareRideNames(firstRide, secondRide),
    );
  const unpinnedRides = visibleRides
    .filter((ride) => !pinnedRideIds.has(ride.id))
    .sort(compareRideNames);

  if (isCatalogLoading || isPreferencesLoading) {
    return <RideListSkeleton bottomInset={bottomInset} />;
  }

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
        isFavorite={favoriteRideIds.has(item.id)}
        isPinned
        isPinnedDivider={
          index === pinnedRides.length - 1 && unpinnedRides.length > 0
        }
        liveStatus={liveData?.[normalizeRideName(item.name)]}
        onPress={onRidePress}
        ride={item}
        reserveLiveStatusSpace
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

  const unpinnedRidesFooter = (
    <View>
      {unpinnedRides.map((ride) => (
        <RideListItem
          key={ride.id}
          isFavorite={favoriteRideIds.has(ride.id)}
          liveStatus={liveData?.[normalizeRideName(ride.name)]}
          onPress={onRidePress}
          ride={ride}
          reserveLiveStatusSpace
        />
      ))}
      {hiddenRides.length > 0 && (
        <>
          <Pressable
            accessibilityLabel={`${showHiddenRides ? 'Hide' : 'Show'} ${hiddenRides.length} hidden attractions`}
            accessibilityRole='button'
            accessibilityState={{ expanded: showHiddenRides }}
            onPress={() => setShowHiddenRides((current) => !current)}
            style={styles.hiddenRidesDisclosure}
          >
            <Text style={[styles.hiddenRidesLabel, { color: colors.accent }]}>
              {showHiddenRides ? 'Hide' : 'Show'} hidden attractions (
              {hiddenRides.length})
            </Text>
            <SymbolView
              name={{
                ios: showHiddenRides ? 'chevron.up' : 'chevron.down',
                android: showHiddenRides ? 'expand_less' : 'expand_more',
                web: showHiddenRides ? 'expand_less' : 'expand_more',
              }}
              size={18}
              tintColor={colors.accent}
            />
          </Pressable>
          {showHiddenRides &&
            hiddenRides.map((ride) => (
              <RideListItem
                key={ride.id}
                isFavorite={favoriteRideIds.has(ride.id)}
                isHidden
                liveStatus={liveData?.[normalizeRideName(ride.name)]}
                onPress={onRidePress}
                ride={ride}
                reserveLiveStatusSpace
              />
            ))}
        </>
      )}
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
      extraData={{
        liveData,
        pinnedRideIds,
        favoriteRideIds,
        pinnedRideOrder,
        hiddenRideIds,
        showHiddenRides,
      }}
      keyExtractor={(ride) => ride.id}
      ListFooterComponent={unpinnedRidesFooter}
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
      onDragEnd={({ data }) => updateParkPinnedRideOrder(data)}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          tintColor={colors.accent}
        />
      }
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
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}

function RideListSkeleton({ bottomInset }: { bottomInset: number }) {
  return (
    <View
      accessibilityLabel='Loading rides'
      style={[
        styles.listContent,
        { paddingBottom: bottomInset + BottomTabInset + 24 },
      ]}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonLogo} />
          <View style={styles.skeletonCopy}>
            <View style={[styles.skeletonBar, styles.skeletonTitle]} />
            <View style={[styles.skeletonBar, styles.skeletonSubtitle]} />
            <View style={[styles.skeletonBar, styles.skeletonStatus]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
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
  hiddenRidesDisclosure: {
    alignItems: 'center',
    borderTopColor: '#dce7f2',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 4,
  },
  hiddenRidesLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  skeletonRow: {
    alignItems: 'center',
    borderBottomColor: '#e3e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 76,
    paddingVertical: 14,
  },
  skeletonLogo: {
    backgroundColor: '#edf0f3',
    borderRadius: 28,
    height: 56,
    marginRight: 16,
    width: 56,
  },
  skeletonCopy: {
    flex: 1,
    gap: 7,
  },
  skeletonBar: {
    backgroundColor: '#edf0f3',
    borderRadius: 3,
    height: 10,
  },
  skeletonTitle: {
    height: 14,
    width: '68%',
  },
  skeletonSubtitle: {
    width: '38%',
  },
  skeletonStatus: {
    height: 8,
    width: '24%',
  },
});
