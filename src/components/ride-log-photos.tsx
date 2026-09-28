import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

type RideLogPhotosProps = {
  addPhotoDisabled?: boolean;
  onAddPhoto?: () => void;
  photos: string[];
  onRemove?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function RideLogPhotos({
  addPhotoDisabled = false,
  onAddPhoto,
  photos,
  onRemove,
  style,
}: RideLogPhotosProps) {
  const insets = useSafeAreaInsets();
  const windowWidth = useWindowDimensions().width;
  const [gridWidth, setGridWidth] = useState<number | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(
    null,
  );
  const photoSize = Math.min(128, ((gridWidth ?? windowWidth - 48) - 16) / 3);
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
        {onAddPhoto ? (
          <View
            onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
            style={styles.formPhotoRows}
          >
            {Array.from(
              { length: Math.ceil((photos.length + 1) / 3) },
              (_, rowIndex) => {
                const start = rowIndex * 3;
                const rowPhotos = photos.slice(start, start + 3);
                const showAddTile = start + 3 > photos.length;

                return (
                  <View key={rowIndex} style={styles.formPhotoRow}>
                    {rowPhotos.map((uri, index) => (
                      <View
                        key={`${uri}-${start + index}`}
                        style={[
                          styles.thumbnailContainer,
                          { height: photoSize, width: photoSize },
                        ]}
                      >
                        <Pressable
                          accessibilityLabel={`View photo ${start + index + 1}`}
                          accessibilityRole='button'
                          onPress={() => setViewingPhotoIndex(start + index)}
                        >
                          <Image
                            contentFit='cover'
                            source={{ uri }}
                            style={[
                              styles.thumbnail,
                              { height: photoSize, width: photoSize },
                            ]}
                          />
                        </Pressable>
                        {onRemove && (
                          <Pressable
                            accessibilityLabel={`Remove photo ${start + index + 1}`}
                            accessibilityRole='button'
                            hitSlop={6}
                            onPress={() => onRemove(start + index)}
                            style={styles.removeButton}
                          >
                            <SymbolView
                              name='xmark'
                              size={11}
                              tintColor='#ffffff'
                            />
                          </Pressable>
                        )}
                      </View>
                    ))}
                    {showAddTile && (
                      <Pressable
                        accessibilityLabel='Add photos'
                        accessibilityRole='button'
                        disabled={addPhotoDisabled}
                        onPress={onAddPhoto}
                        style={({ pressed }) => [
                          styles.addPhotoTile,
                          {
                            borderColor: Colors.light.accent,
                            height: photoSize,
                            width: photoSize,
                          },
                          (pressed || addPhotoDisabled) &&
                            styles.addPhotoTileInactive,
                        ]}
                      >
                        <SymbolView
                          name={{
                            ios: 'photo.badge.plus',
                            android: 'add_photo_alternate',
                            web: 'add_photo_alternate',
                          }}
                          size={32}
                          tintColor={Colors.light.accent}
                        />
                      </Pressable>
                    )}
                  </View>
                );
              },
            )}
          </View>
        ) : (
          photos.map((uri, index) => (
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
          ))
        )}
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
  formPhotoRows: {
    gap: 8,
    width: '100%',
  },
  formPhotoRow: {
    flexDirection: 'row',
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
  addPhotoTile: {
    alignItems: 'center',
    borderRadius: 6,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
  },
  addPhotoTileInactive: {
    opacity: 0.45,
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
