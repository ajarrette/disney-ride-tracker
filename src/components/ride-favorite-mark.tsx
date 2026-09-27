import { StyleSheet, Text } from 'react-native';

type RideFavoriteMarkProps = {
  isFavorite: boolean;
  onToggle?: (isFavorite: boolean) => void;
  accessibilityLabel?: string;
};

export function RideFavoriteMark({
  isFavorite,
  onToggle,
  accessibilityLabel,
}: RideFavoriteMarkProps) {
  if (!isFavorite && !onToggle) return null;

  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onToggle ? 'button' : undefined}
      accessibilityState={onToggle ? { checked: isFavorite } : undefined}
      onPress={onToggle ? () => onToggle(!isFavorite) : undefined}
      suppressHighlighting={Boolean(onToggle)}
      style={[styles.heart, !isFavorite && styles.outline]}
    >
      {' '}
      {isFavorite ? '\u2665' : '\u2661'}
    </Text>
  );
}

const styles = StyleSheet.create({
  heart: {
    color: '#B12228',
  },
  outline: {
    color: '#B0B4BA',
    fontWeight: '300',
  },
});
