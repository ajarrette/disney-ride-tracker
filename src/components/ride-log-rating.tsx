import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';

type RideLogRatingProps = {
  onChange: (rating: number) => void;
  rating: number | null;
};

export function RideLogRating({ onChange, rating }: RideLogRatingProps) {
  const colors = Colors.light;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((value) => {
        const currentRating = rating ?? 0;
        const isFull = currentRating >= value;
        const isHalf = !isFull && currentRating >= value - 0.5;

        return (
          <View key={value} style={styles.star}>
            <SymbolView
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
                web: isFull ? 'star' : isHalf ? 'star_half' : 'star_outline',
              }}
              size={28}
              tintColor={
                isFull || isHalf ? colors.accent : colors.textSecondary
              }
            />
            <Pressable
              accessibilityLabel={`Rate ${value - 0.5} out of 5`}
              accessibilityRole='button'
              accessibilityState={{ selected: rating === value - 0.5 }}
              onPress={() => onChange(value - 0.5)}
              style={[styles.halfButton, styles.left]}
            />
            <Pressable
              accessibilityLabel={`Rate ${value} out of 5`}
              accessibilityRole='button'
              accessibilityState={{ selected: rating === value }}
              onPress={() => onChange(value)}
              style={[styles.halfButton, styles.right]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  star: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  halfButton: {
    height: 44,
    position: 'absolute',
    top: 0,
    width: 22,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
});
