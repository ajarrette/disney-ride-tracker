import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RideTripSelector } from '@/components/ride-trip-selector';
import { useRideTrips } from '@/components/ride-trips-provider';
import { ParkLabels } from '@/constants/ride-labels';
import { Colors } from '@/constants/theme';
import { Park, Ride } from '@/models/ride';
import { RideLog } from '@/models/ride-log';

const parkColors: Record<Park, string> = {
  [Park.MagicKingdom]: '#B12228',
  [Park.Epcot]: '#27849A',
  [Park.HollywoodStudios]: '#D39124',
  [Park.AnimalKingdom]: '#438267',
};

type RideDiarySummaryProps = {
  onSelectTrip: (tripId: string | null) => void;
  rideLogs: RideLog[];
  ridesById: ReadonlyMap<string, Ride>;
  selectedTripId: string | null;
};

export function RideDiarySummary({
  onSelectTrip,
  rideLogs,
  ridesById,
  selectedTripId,
}: RideDiarySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { trips } = useRideTrips();
  if (rideLogs.length === 0 && trips.length === 0 && selectedTripId === null)
    return null;

  const rideCounts = new Map<string, number>();
  const parkCounts = new Map<Park, number>();
  const dayCounts = new Map<string, { count: number; date: Date }>();
  let totalWaitMinutes = 0;
  let recordedWaitCount = 0;
  let ratingTotal = 0;
  let ratingCount = 0;

  rideLogs.forEach((log) => {
    rideCounts.set(log.rideId, (rideCounts.get(log.rideId) ?? 0) + 1);
    const ride = ridesById.get(log.rideId);
    if (ride) parkCounts.set(ride.park, (parkCounts.get(ride.park) ?? 0) + 1);

    const date = new Date(log.visitedAt);
    const dayKey = [date.getFullYear(), date.getMonth(), date.getDate()].join(
      '-',
    );
    const day = dayCounts.get(dayKey);
    dayCounts.set(dayKey, { count: (day?.count ?? 0) + 1, date });

    if (
      typeof log.waitTimeMinutes === 'number' &&
      Number.isFinite(log.waitTimeMinutes) &&
      log.waitTimeMinutes >= 0
    ) {
      totalWaitMinutes += log.waitTimeMinutes;
      recordedWaitCount += 1;
    }
    if (typeof log.rating === 'number' && Number.isFinite(log.rating)) {
      ratingTotal += log.rating;
      ratingCount += 1;
    }
  });

  const mostRidden = [...rideCounts.entries()].sort(
    (first, second) => second[1] - first[1],
  )[0] ?? ['', 0];
  const mostRiddenName =
    (mostRidden[0] ? ridesById.get(mostRidden[0])?.name : null) ?? '—';
  const biggestRideDay = [...dayCounts.values()].sort(
    (first, second) => second.count - first.count,
  )[0] ?? { count: 0, date: new Date() };
  const maxParkCount = Math.max(1, ...parkCounts.values());
  const parksVisited = [...parkCounts.values()].filter(
    (count) => count > 0,
  ).length;
  const lightningLaneUses = rideLogs.filter(
    (log) => log.lightningLaneUsed === true,
  ).length;
  const roundedWaitMinutes = Math.round(totalWaitMinutes);
  const waitHours = Math.floor(roundedWaitMinutes / 60);
  const waitRemainder = roundedWaitMinutes % 60;
  const formattedWait =
    waitHours > 0
      ? `${waitHours}h ${waitRemainder}m`
      : `${roundedWaitMinutes}m`;
  const colors = Colors.light;

  return (
    <View
      accessibilityLabel='Ride diary summary'
      style={[styles.summary, { backgroundColor: '#FFF8F5' }]}
    >
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Your ride story
        </Text>
        <RideTripSelector
          allowNone
          isCompact
          label='Ride story period'
          noneLabel='All Time'
          noneSubtitle='Include every ride'
          onSelect={onSelectTrip}
          selectedTripId={selectedTripId}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#B12228' }]}>
            {rideLogs.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            RIDES
          </Text>
        </View>
        <View style={[styles.stat, styles.alignCenter]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {recordedWaitCount > 0 ? formattedWait : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            TOTAL WAIT
          </Text>
          <Text style={[styles.statNote, { color: colors.textSecondary }]}>
            {recordedWaitCount} logged
          </Text>
        </View>
        <View style={[styles.stat, styles.alignRight]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {ratingCount > 0 ? (ratingTotal / ratingCount).toFixed(1) : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            AVG. RATING
          </Text>
        </View>
      </View>

      {isExpanded && (
        <>
          <View style={[styles.divider, { backgroundColor: '#EBDDD7' }]} />

          <View style={styles.highlightRow}>
            <View style={styles.highlight}>
              <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
                MOST RIDDEN
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.highlightTitle, { color: colors.text }]}
              >
                {mostRiddenName}
              </Text>
              <Text style={[styles.highlightDetail, { color: '#B12228' }]}>
                {mostRidden[1]} {mostRidden[1] === 1 ? 'ride' : 'rides'}
              </Text>
            </View>
            <View style={[styles.highlight, styles.alignRight]}>
              <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
                BIGGEST RIDE DAY
              </Text>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                {biggestRideDay.count}{' '}
                {biggestRideDay.count === 1 ? 'ride' : 'rides'}
              </Text>
              <Text
                style={[
                  styles.highlightDetail,
                  { color: colors.textSecondary },
                ]}
              >
                {rideLogs.length === 0
                  ? '—'
                  : biggestRideDay.date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </Text>
            </View>
          </View>

          <View style={styles.lightningLaneRow}>
            <View style={styles.lightningLaneLabel}>
              <SymbolView
                name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
                size={15}
                tintColor={colors.accent}
              />
              <Text style={[styles.lightningLaneText, { color: colors.text }]}>
                Lightning Lanes
              </Text>
            </View>
            <Text style={[styles.lightningLaneValue, { color: colors.accent }]}>
              {lightningLaneUses} {lightningLaneUses === 1 ? 'use' : 'uses'}
            </Text>
          </View>

          <View style={styles.parkHeadingRow}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
              PARK MIX
            </Text>
            <Text style={[styles.parkCount, { color: colors.textSecondary }]}>
              {parksVisited}{' '}
              {parksVisited === 1 ? 'park explored' : 'parks explored'}
            </Text>
          </View>
          {Object.values(Park).map((park) => {
            const count = parkCounts.get(park) ?? 0;
            return (
              <View key={park} style={styles.parkRow}>
                <Text
                  numberOfLines={1}
                  style={[styles.parkLabel, { color: colors.text }]}
                >
                  {ParkLabels[park]}
                </Text>
                <View
                  style={[styles.parkTrack, { backgroundColor: '#EDE6E2' }]}
                >
                  <View
                    style={[
                      styles.parkBar,
                      {
                        backgroundColor: parkColors[park],
                        width: `${(count / maxParkCount) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.parkValue, { color: colors.textSecondary }]}
                >
                  {count}
                </Text>
              </View>
            );
          })}
        </>
      )}

      <Pressable
        accessibilityLabel={
          isExpanded ? 'Show fewer summary stats' : 'Show more summary stats'
        }
        accessibilityRole='button'
        accessibilityState={{ expanded: isExpanded }}
        hitSlop={{ top: 8, bottom: 8 }}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.expandButton}
      >
        <Text style={[styles.expandText, { color: colors.accent }]}>
          {isExpanded ? 'Show less' : 'More stats'}
        </Text>
        <SymbolView
          name={{
            ios: isExpanded ? 'chevron.up' : 'chevron.down',
            android: isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
            web: isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
          }}
          size={14}
          tintColor={colors.accent}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderColor: '#EBDDD7',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    padding: 16,
    paddingBottom: 8,
  },
  statNote: {
    fontSize: 9,
    marginTop: 1,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  expandButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 2,
    minHeight: 28,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  stat: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  highlight: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 5,
  },
  highlightDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  lightningLaneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  lightningLaneLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  lightningLaneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lightningLaneValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  parkHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 16,
  },
  parkCount: {
    fontSize: 11,
  },
  parkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 18,
  },
  parkLabel: {
    fontSize: 11,
    width: 112,
  },
  parkTrack: {
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  parkBar: {
    borderRadius: 3,
    height: '100%',
  },
  parkValue: {
    fontSize: 11,
    textAlign: 'right',
    width: 20,
  },
});
