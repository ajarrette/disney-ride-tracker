import * as ImagePicker from 'expo-image-picker';

export async function pickRideLogVideo(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Allow access to your Photos library to attach a video.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: false,
    mediaTypes: ['videos'],
    shouldDownloadFromNetwork: true,
    videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
  });
  if (result.canceled) return null;

  const assetId = result.assets[0]?.assetId;
  if (!assetId) {
    throw new Error(
      'This video could not be linked to your Photos library. Choose another video or allow access to it in Settings.',
    );
  }
  return assetId;
}
