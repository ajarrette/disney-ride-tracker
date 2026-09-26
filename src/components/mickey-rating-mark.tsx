import { StyleSheet, View } from 'react-native';

type MickeyRatingMarkProps = {
  color: string;
  filled?: boolean;
  width?: number;
};

export function MickeyRatingMark({
  color,
  filled = false,
  width = 36,
}: MickeyRatingMarkProps) {
  const scale = width / 36;
  const shapeStyle = filled
    ? { backgroundColor: color }
    : {
        backgroundColor: 'transparent',
        borderColor: color,
        borderWidth: 2 * scale,
      };
  const earStyle = {
    borderRadius: 7 * scale,
    height: 14 * scale,
    top: 0,
    width: 14 * scale,
  };

  return (
    <View style={[styles.mickey, { height: 30 * scale, width }]}>
      <View
        style={[
          styles.head,
          {
            borderRadius: 11 * scale,
            height: 22 * scale,
            left: 7 * scale,
            top: 7 * scale,
            width: 22 * scale,
          },
          shapeStyle,
        ]}
      />
      <View style={[styles.ear, styles.leftEar, earStyle, shapeStyle]} />
      <View style={[styles.ear, styles.rightEar, earStyle, shapeStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mickey: {
    position: 'relative',
  },
  ear: {
    position: 'absolute',
  },
  leftEar: {
    left: 0,
  },
  rightEar: {
    right: 0,
  },
  head: {
    position: 'absolute',
  },
});
