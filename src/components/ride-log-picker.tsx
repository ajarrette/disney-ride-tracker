import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResortPickerSheet } from '@/components/resort-picker-sheet';
import { useResortPreferences } from '@/components/resort-preferences-provider';
import { useRidePreferences } from '@/components/ride-preferences-provider';
import { ResortOptions } from '@/constants/resorts';
import { Colors } from '@/constants/theme';
import { Ride } from '@/models/ride';
import { RideListItem } from './ride-list-item';

type RideLogPickerProps = {
  filteredRides: Ride[];
  hasError: boolean;
  isLoading: boolean;
  onChooseRide: (ride: Ride) => void;
  onQueryChange: (query: string) => void;
  onRecentSearch: (search: string) => void;
  onSubmitSearch: () => void;
  query: string;
  recentRideSearches: string[];
  rideCount: number;
};

export function RideLogPicker({
  filteredRides,
  hasError,
  isLoading,
  onChooseRide,
  onQueryChange,
  onRecentSearch,
  onSubmitSearch,
  query,
  recentRideSearches,
  rideCount,
}: RideLogPickerProps) {
  const colors = Colors.light;
  const { favoriteRideIds } = useRidePreferences();
  const { selectedResortId } = useResortPreferences();
  const insets = useSafeAreaInsets();
  const normalizedQuery = query.trim();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isResortPickerVisible, setIsResortPickerVisible] = useState(false);
  const selectedResort =
    ResortOptions.find((option) => option.id === selectedResortId) ??
    ResortOptions[0];
  const visibleRides = filteredRides.filter(
    (ride) =>
      selectedResort.parks === null || selectedResort.parks.has(ride.park),
  );

  return (
    <>
      <View style={styles.resortSection}>
        <Text
          style={[styles.resortSelectorLabel, { color: colors.textSecondary }]}
        >
          Resort
        </Text>
        <Pressable
          accessibilityLabel={`Resort: ${selectedResort.label}`}
          accessibilityRole='button'
          accessibilityHint='Choose which resort to search.'
          onPress={() => setIsResortPickerVisible(true)}
          style={styles.resortSelector}
        >
          <SymbolView
            name={{
              ios: 'mappin.and.ellipse',
              android: 'location_on',
              web: 'place',
            }}
            size={20}
            tintColor='#B12228'
          />
          <Text
            numberOfLines={1}
            style={[styles.resortSelectorText, { color: colors.text }]}
          >
            {selectedResort.label}
          </Text>
          <SymbolView
            name={{
              ios: 'chevron.down',
              android: 'expand_more',
              web: 'expand_more',
            }}
            size={15}
            tintColor={colors.textSecondary}
          />
        </Pressable>
      </View>
      <View
        style={[
          styles.searchContainer,
          isSearchFocused && styles.searchContainerFocused,
        ]}
      >
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={20}
          tintColor={colors.accent}
        />
        <TextInput
          accessibilityLabel='Name of ride'
          autoCapitalize='none'
          onBlur={() => setIsSearchFocused(false)}
          onChangeText={onQueryChange}
          onFocus={() => setIsSearchFocused(true)}
          onSubmitEditing={onSubmitSearch}
          placeholder='Search rides, parks or lands.'
          placeholderTextColor={colors.textSecondary}
          returnKeyType='search'
          style={[styles.searchInput, { color: colors.text }]}
          value={query}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityLabel='Clear search'
            accessibilityRole='button'
            hitSlop={8}
            onPress={() => onQueryChange('')}
          >
            <SymbolView
              name={{
                ios: 'xmark.circle.fill',
                android: 'cancel',
                web: 'cancel',
              }}
              size={20}
              tintColor={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      <ResortPickerSheet
        onClose={() => setIsResortPickerVisible(false)}
        visible={isResortPickerVisible}
      />
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        data={visibleRides}
        keyboardShouldPersistTaps='handled'
        keyExtractor={(ride) => ride.id}
        ListHeaderComponent={
          !normalizedQuery && recentRideSearches.length > 0 ? (
            <View style={styles.recentSearches}>
              <Text
                style={[
                  styles.recentSearchesLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Recent searches
              </Text>
              {recentRideSearches.map((search) => (
                <Pressable
                  accessibilityRole='button'
                  key={search}
                  onPress={() => onRecentSearch(search)}
                  style={styles.recentSearchItem}
                >
                  <SymbolView
                    name={{
                      ios: 'clock.arrow.circlepath',
                      android: 'history',
                      web: 'history',
                    }}
                    size={16}
                    tintColor={colors.textSecondary}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.recentSearchText, { color: colors.text }]}
                  >
                    {search}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : hasError && rideCount === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Ride catalog unavailable. Check your connection and Supabase
              configuration.
            </Text>
          ) : normalizedQuery || recentRideSearches.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {normalizedQuery
                ? selectedResortId === 'all'
                  ? 'No rides match your search.'
                  : `No rides match your search in ${selectedResort.label}.`
                : 'Search by ride name, park, type, warning, or land.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <RideListItem
            isFavorite={favoriteRideIds.has(item.id)}
            ride={item}
            showPark
            onPress={onChooseRide}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderColor: '#C5CBD3',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 14,
  },
  searchContainerFocused: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.accent,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: 10,
  },
  resortSelector: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderColor: '#D9DEE7',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  resortSection: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  resortSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  resortSelectorText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  recentSearches: {
    paddingTop: 20,
  },
  recentSearchesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  recentSearchItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 44,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 15,
  },
  emptyText: {
    fontSize: 15,
    paddingTop: 28,
    textAlign: 'center',
  },
  loading: {
    marginTop: 24,
  },
});
