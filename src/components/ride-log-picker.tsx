import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const normalizedQuery = query.trim();

  return (
    <>
      <View style={styles.searchContainer}>
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={20}
          tintColor={colors.textSecondary}
        />
        <TextInput
          accessibilityLabel='Name of ride'
          autoCapitalize='none'
          onChangeText={onQueryChange}
          onSubmitEditing={onSubmitSearch}
          placeholder='Search by ride name, park or land.'
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
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        data={filteredRides}
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
                ? 'No rides match your search.'
                : 'Search by ride name, park, type, warning, or land.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <RideListItem ride={item} onPress={onChooseRide} />
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
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 20,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: 10,
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
