import * as MediaLibrary from 'expo-media-library/legacy';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type RideLogVideoProps = {
  assetId: string;
  onRemove?: () => void;
};

function RideLogVideoPlayer({
  uri,
  onClose,
}: {
  uri: string;
  onClose: () => void;
}) {
  const player = useVideoPlayer(uri, (videoPlayer) => videoPlayer.play());

  return (
    <View style={styles.viewer}>
      <Pressable
        accessibilityLabel='Close video'
        accessibilityRole='button'
        onPress={onClose}
        style={styles.closeButton}
      >
        <SymbolView name='xmark' size={21} tintColor='#ffffff' />
      </Pressable>
      <VideoView
        contentFit='contain'
        fullscreenOptions={{ enable: true }}
        nativeControls
        player={player}
        style={styles.video}
      />
    </View>
  );
}

export function RideLogVideo({ assetId, onRemove }: RideLogVideoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const openVideo = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setIsUnavailable(false);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(false, [
        'video',
      ]);
      if (!permission.granted) throw new Error('Photo access was not granted.');

      const asset = await MediaLibrary.getAssetInfoAsync(assetId, {
        shouldDownloadFromNetwork: true,
      });
      setVideoUri(asset.uri);
      setIsVisible(true);
    } catch {
      setIsUnavailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeVideo = () => setIsVisible(false);

  return (
    <>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={
            isUnavailable ? 'Video unavailable' : 'Play video'
          }
          accessibilityRole='button'
          disabled={isLoading}
          onPress={() => void openVideo()}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.pressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color='#263d5a' />
          ) : (
            <SymbolView
              name={{
                ios: 'play.fill',
                android: 'play_arrow',
                web: 'play_arrow',
              }}
              size={20}
              tintColor='#263d5a'
            />
          )}
          <View style={styles.labelGroup}>
            <Text style={styles.title}>Ride video</Text>
            <Text style={styles.subtitle}>
              {isUnavailable ? 'Unavailable in Photos' : 'Stored in Photos'}
            </Text>
          </View>
        </Pressable>
        {onRemove && (
          <Pressable
            accessibilityLabel='Remove video'
            accessibilityRole='button'
            hitSlop={8}
            onPress={onRemove}
            style={styles.removeButton}
          >
            <SymbolView name='xmark' size={15} tintColor='#5d6875' />
          </Pressable>
        )}
      </View>
      <Modal
        animationType='fade'
        onRequestClose={closeVideo}
        statusBarTranslucent
        transparent
        visible={isVisible}
      >
        {videoUri && <RideLogVideoPlayer onClose={closeVideo} uri={videoUri} />}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#eef2f6',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.72,
  },
  labelGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#263d5a',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#617080',
    fontSize: 12,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: '#eef2f6',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  viewer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  video: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
});
