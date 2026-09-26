import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { RideOperatingHour } from '@/data/live-wait-times';

const maximumWaitTime = 120;
const chartTitleColor = '#263d5a';
const chartAxisLabelColor = '#8094a0';

function getHour(dateTime: string): number | null {
  const match = dateTime.match(/T(\d{2}):/);
  return match ? Number(match[1]) : null;
}

function formatHour(hour: number): string {
  return `${hour % 12 || 12}${hour >= 12 ? 'pm' : 'am'}`;
}

type RideWaitForecastChartProps = {
  forecastedWaitTimes: (number | null)[];
  operatingHours: RideOperatingHour[];
};

export function RideWaitForecastChart({
  forecastedWaitTimes,
  operatingHours,
}: RideWaitForecastChartProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const startHours = operatingHours
    .map((operatingHour) => getHour(operatingHour.startTime))
    .filter((hour): hour is number => hour !== null);
  const endHours = operatingHours
    .map((operatingHour) => getHour(operatingHour.endTime))
    .filter((hour): hour is number => hour !== null);
  const startHour = startHours.length > 0 ? Math.min(...startHours) : 8;
  const operatingEndHour = endHours.length > 0 ? Math.max(...endHours) : 17;
  const endHour = operatingEndHour <= startHour ? 24 : operatingEndHour;
  const hours = Array.from(
    { length: Math.max(1, endHour - startHour) },
    (_, index) => startHour + index,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Forecasted Wait</Text>
      <Text style={styles.subtitle}>
        Estimated wait times (subject to change)
      </Text>
      <View
        accessibilityLabel='Hourly forecasted wait times for today'
        style={styles.plot}
      >
        <View pointerEvents='none' style={styles.grid}>
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} style={styles.gridLine} />
          ))}
        </View>
        <View style={styles.bars}>
          {hours.map((hour) => {
            const waitTime = forecastedWaitTimes[hour];
            const hasWaitTime = typeof waitTime === 'number';
            const isSelected = selectedHour === hour;
            const heightPercent = hasWaitTime
              ? Math.min(Math.max(waitTime, 0), maximumWaitTime) /
                maximumWaitTime
              : 0;

            return (
              <Pressable
                key={hour}
                accessibilityLabel={
                  hasWaitTime
                    ? `${formatHour(hour)}, ${Math.round(waitTime)} minute average wait`
                    : `${formatHour(hour)}, no wait time data`
                }
                accessibilityRole='button'
                accessibilityState={{ selected: isSelected }}
                disabled={!hasWaitTime}
                onPress={() => setSelectedHour(isSelected ? null : hour)}
                style={[styles.barCell, isSelected && styles.selectedBarCell]}
              >
                {isSelected && hasWaitTime && (
                  <Text
                    style={[
                      styles.waitValue,
                      { bottom: `${heightPercent * 100}%` },
                    ]}
                  >
                    {Math.round(waitTime)} min
                  </Text>
                )}
                {hasWaitTime && heightPercent > 0 && (
                  <View
                    style={[styles.bar, { height: `${heightPercent * 100}%` }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.hourLabels}>
        {hours.map((hour, index) => (
          <View key={hour} style={styles.hourLabelCell}>
            {index % 2 === 0 && (
              <Text style={styles.hourLabel}>{formatHour(hour)}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderBottomColor: '#dce7f2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    color: chartTitleColor,
    fontFamily: Fonts.rounded,
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: chartTitleColor,
    fontFamily: Fonts.rounded,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  plot: {
    height: 90,
    marginTop: 24,
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  gridLine: {
    backgroundColor: '#e7eef0',
    height: StyleSheet.hairlineWidth,
  },
  bars: {
    ...StyleSheet.absoluteFill,
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  barCell: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  selectedBarCell: {
    zIndex: 1,
  },
  waitValue: {
    color: chartAxisLabelColor,
    fontFamily: Fonts.rounded,
    fontSize: 12,
    fontWeight: '700',
    left: 0,
    lineHeight: 16,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    transform: [{ translateY: -4 }],
  },
  bar: {
    backgroundColor: '#e4edef',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    width: '72%',
  },
  hourLabels: {
    flexDirection: 'row',
    marginTop: 8,
  },
  hourLabelCell: {
    alignItems: 'center',
    flex: 1,
  },
  hourLabel: {
    color: chartAxisLabelColor,
    fontFamily: Fonts.rounded,
    fontSize: 13,
    lineHeight: 18,
  },
});
