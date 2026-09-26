import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { RideLiveData } from '@/data/live-wait-times';

export function RideLiveStatusLine({
  liveStatus,
  color: colorOverride,
}: {
  liveStatus?: RideLiveData;
  color?: string;
}) {
  if (!liveStatus) {
    return null;
  }

  const label =
    liveStatus.status === 'OPERATING'
      ? liveStatus.waitTime === null
        ? 'Operating'
        : `${liveStatus.waitTime} min wait`
      : liveStatus.status === 'DOWN'
        ? 'Temporarily Closed'
        : liveStatus.status === 'REFURBISHMENT'
          ? 'Refurbishment'
          : liveStatus.status === 'CLOSED'
            ? 'Closed'
            : liveStatus.status.replaceAll('_', ' ').toLowerCase();
  const isClosedStatus = ['DOWN', 'CLOSED', 'REFURBISHMENT'].includes(
    liveStatus.status,
  );
  const statusColor = isClosedStatus ? '#ff3b10' : '#263d5a';
  const waitTrend = liveStatus.waitTrend;

  return (
    <View style={styles.liveStatusRow}>
      <Text
        style={[styles.liveStatus, { color: colorOverride ?? statusColor }]}
      >
        {liveStatus.status === 'OPERATING' && liveStatus.waitTime !== null ? (
          <>
            <Text style={styles.waitNumber}>{liveStatus.waitTime}</Text>
            {' min wait'}
          </>
        ) : (
          label
        )}
      </Text>
      {liveStatus.status === 'OPERATING' &&
        liveStatus.waitTime !== null &&
        waitTrend && (
          <SymbolView
            accessibilityLabel={
              waitTrend === 'lower'
                ? 'Lower than yesterday at this time'
                : 'Higher than yesterday at this time'
            }
            name={
              waitTrend === 'lower'
                ? {
                    ios: 'chart.line.downtrend.xyaxis',
                    android: 'trending_down',
                    web: 'trending_down',
                  }
                : {
                    ios: 'chart.line.uptrend.xyaxis',
                    android: 'trending_up',
                    web: 'trending_up',
                  }
            }
            size={16}
            tintColor={waitTrend === 'lower' ? '#25833A' : '#D33131'}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  liveStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  liveStatus: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  waitNumber: {
    fontWeight: '700',
  },
});
