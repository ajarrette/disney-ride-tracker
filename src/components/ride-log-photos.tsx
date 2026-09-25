import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

type RideLogPhotosProps = {
  photos: string[];
  onRemove?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function RideLogPhotos({ photos, onRemove, style }: RideLogPhotosProps) {
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  return (
    <>
      <View style={[styles.thumbnailList, style]}>
        {photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.thumbnailContainer}>
            <Pressable
              accessibilityLabel={`View photo ${index + 1}`}
              accessibilityRole='button'
              onPress={() => setViewingPhoto(uri)}
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
        onRequestClose={() => setViewingPhoto(null)}
        transparent
        visible={viewingPhoto !== null}
      >
        <View style={styles.viewer}>
          <Pressable
            accessibilityLabel='Close photo viewer'
            accessibilityRole='button'
            onPress={() => setViewingPhoto(null)}
            style={styles.viewerClose}
          >
            <SymbolView name='xmark' size={22} tintColor='#ffffff' />
          </Pressable>
          {viewingPhoto && (
            <Image
              contentFit='contain'
              source={{ uri: viewingPhoto }}
              style={styles.fullImage}
            />
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
    alignSelf: 'flex-end',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  fullImage: {
    flex: 1,
    width: '100%',
  },
});
