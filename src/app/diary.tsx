import { Image } from 'expo-image';
import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/components/app-state';
import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { getRideLogo } from '@/data/ride-images';
import { seedRides } from '@/data/rides';

export default function DiaryScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(() => new Animated.Value(0));
  const { rideLogs } = useAppState();
  const ridesById = new Map(seedRides.map((ride) => [ride.id, ride]));
  const groupedLogs = new Map<string, typeof rideLogs>();

  [...rideLogs]
    .sort(
      (first, second) =>
        new Date(second.visitedAt).getTime() -
        new Date(first.visitedAt).getTime(),
    )
    .forEach((log) => {
      const visitedAt = new Date(log.visitedAt);
      const dayKey = [
        visitedAt.getFullYear(),
        visitedAt.getMonth(),
        visitedAt.getDate(),
      ].join('-');
      const dayLogs = groupedLogs.get(dayKey) ?? [];
      dayLogs.push(log);
      groupedLogs.set(dayKey, dayLogs);
    });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [8, 44],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [8, 44],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24 },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <Animated.Text
          style={[
            styles.title,
            {
              color: colors.text,
              opacity: largeTitleOpacity,
            },
          ]}
        >
          Diary
        </Animated.Text>
        {rideLogs.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Rides you log will appear here.
          </Text>
        ) : (
          [...groupedLogs.entries()].map(([dayKey, logs]) => {
            const firstLog = logs[0];
            const date = new Date(firstLog.visitedAt);

            return (
              <View key={dayKey}>
                <View
                  style={[
                    styles.dayHeader,
                    { backgroundColor: colors.backgroundElement },
                  ]}
                >
                  <Text
                    style={[styles.dayTitle, { color: colors.textSecondary }]}
                  >
                    {date.toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                {logs.map((log, index) => {
                  const ride = ridesById.get(log.rideId);
                  if (!ride) return null;

                  const logo = getRideLogo(
                    ride.park,
                    ride.logoUrl,
                    ride.backgroundUrl,
                  );

                  return (
                    <View
                      key={log.id}
                      style={[
                        styles.entry,
                        index < logs.length - 1 && styles.entryDivider,
                        { borderBottomColor: colors.backgroundSelected },
                      ]}
                    >
                      <View
                        style={[
                          styles.rideLogo,
                          { backgroundColor: colors.backgroundElement },
                        ]}
                      >
                        {logo ? (
                          <Image
                            contentFit='cover'
                            recyclingKey={ride.id}
                            source={logo}
                            style={styles.rideLogoImage}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.logoFallback,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {ride.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.entryCopy}>
                        <View style={styles.titleRow}>
                          <Text
                            style={[styles.rideName, { color: colors.text }]}
                          >
                            {ride.name}
                          </Text>
                          <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const rating = log.rating ?? 0;
                              const isFull = rating >= star;
                              const isHalf = !isFull && rating >= star - 0.5;

                              return (
                                <SymbolView
                                  key={star}
                                  name={{
                                    ios: isFull
                                      ? 'star.fill'
                                      : isHalf
                                        ? 'star.leadinghalf.filled'
                                        : 'star',
                                    android: isFull
                                      ? 'star'
                                      : isHalf
                                        ? 'star_half'
                                        : 'star_outline',
                                    web: isFull
                                      ? 'star'
                                      : isHalf
                                        ? 'star_half'
                                        : 'star_outline',
                                  }}
                                  size={16}
                                  tintColor={
                                    isFull || isHalf
                                      ? colors.accent
                                      : colors.backgroundSelected
                                  }
                                />
                              );
                            })}
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.metadata,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {dateTime(log.visitedAt)} -{' '}
                          {log.waitTimeMinutes === null
                            ? 'Wait not recorded'
                            : `${log.waitTimeMinutes} min wait`}
                        </Text>
                        <Text
                          style={[
                            styles.metadata,
                            { color: colors.textSecondary },
                          ]}
                        >
                          <Text style={styles.parkName}>
                            {ParkLabels[ride.park]}
                          </Text>
                          {' - '}
                          {LandLabels[ride.land]}
                        </Text>
                        {log.notes.length > 0 && (
                          <Text style={[styles.notes, { color: colors.text }]}>
                            {log.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </Animated.ScrollView>
      <View
        pointerEvents='none'
        style={[
          styles.header,
          { height: insets.top + 44, paddingTop: insets.top },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.background,
              opacity: compactTitleOpacity,
            },
          ]}
        />
        <Animated.Text
          style={[
            styles.compactTitle,
            { color: colors.text, opacity: compactTitleOpacity },
          ]}
        >
          Diary
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  dayHeader: {
    marginHorizontal: -24,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  entry: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingBottom: 16,
    paddingTop: 16,
  },
  entryDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rideLogo: {
    borderRadius: 8,
    height: 52,
    marginRight: 12,
    overflow: 'hidden',
    width: 52,
  },
  rideLogoImage: {
    height: '100%',
    width: '100%',
  },
  logoFallback: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 52,
    textAlign: 'center',
  },
  entryCopy: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rideName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  metadata: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  parkName: {
    fontWeight: '600',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});

function dateTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
