import { StyleSheet, Text } from 'react-native';

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

  return (
    <Text style={[styles.liveStatus, { color: colorOverride ?? statusColor }]}>
      {liveStatus.status === 'OPERATING' && liveStatus.waitTime !== null ? (
        <>
          <Text style={styles.waitNumber}>{liveStatus.waitTime}</Text>
          {' min wait'}
        </>
      ) : (
        label
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  liveStatus: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  waitNumber: {
    fontWeight: '700',
  },
});
