import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RideLogPhotosProps = {
  photos: string[];
  onRemove?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function RideLogPhotos({ photos, onRemove, style }: RideLogPhotosProps) {
  const insets = useSafeAreaInsets();
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(
    null,
  );
  const touchStartX = useRef<number | null>(null);
  const viewingPhoto =
    viewingPhotoIndex === null ? null : (photos[viewingPhotoIndex] ?? null);

  const finishPhotoSwipe = (endX: number) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const distance = endX - startX;
    if (Math.abs(distance) < 48) return;

    setViewingPhotoIndex((currentIndex) => {
      if (currentIndex === null) return null;
      const direction = distance < 0 ? 1 : -1;
      return Math.max(0, Math.min(photos.length - 1, currentIndex + direction));
    });
  };

  return (
    <>
      <View style={[styles.thumbnailList, style]}>
        {photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.thumbnailContainer}>
            <Pressable
              accessibilityLabel={`View photo ${index + 1}`}
              accessibilityRole='button'
              onPress={() => setViewingPhotoIndex(index)}
            >
              <Image
                contentFit='cover'
                source={{ uri }}
                style={styles.thumbnail}
              />
            </Pressable>
            {onRemove && (
              <Pressable
                accessibilityLabel={`Remove photo ${index + 1}`}
                accessibilityRole='button'
                hitSlop={6}
                onPress={() => onRemove(index)}
                style={styles.removeButton}
              >
                <SymbolView name='xmark' size={11} tintColor='#ffffff' />
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <Modal
        animationType='fade'
        onRequestClose={() => setViewingPhotoIndex(null)}
        transparent
        visible={viewingPhotoIndex !== null}
      >
        <View
          style={[
            styles.viewer,
            {
              paddingBottom: insets.bottom + 16,
              paddingTop: insets.top + 60,
            },
          ]}
        >
          <Pressable
            accessibilityLabel='Close photo viewer'
            accessibilityRole='button'
            onPress={() => setViewingPhotoIndex(null)}
            style={[styles.viewerClose, { top: insets.top + 8 }]}
          >
            <SymbolView name='xmark' size={22} tintColor='#ffffff' />
          </Pressable>
          {viewingPhoto && (
            <View
              accessibilityLabel={`Photo ${viewingPhotoIndex! + 1} of ${photos.length}. Swipe left for next photo, right for previous photo.`}
              accessibilityRole='image'
              onResponderGrant={(event) => {
                touchStartX.current = event.nativeEvent.pageX;
              }}
              onResponderRelease={(event) =>
                finishPhotoSwipe(event.nativeEvent.pageX)
              }
              onStartShouldSetResponder={() => true}
              style={styles.imageSwipeArea}
            >
              <Image
                contentFit='contain'
                source={{ uri: viewingPhoto }}
                style={styles.fullImage}
              />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumbnailList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnailContainer: {
    height: 68,
    position: 'relative',
    width: 68,
  },
  thumbnail: {
    borderRadius: 6,
    height: 68,
    width: 68,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -4,
    width: 24,
  },
  viewer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  viewerClose: {
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    zIndex: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  imageSwipeArea: {
    flex: 1,
    width: '100%',
  },
  fullImage: {
    flex: 1,
    width: '100%',
  },
});
