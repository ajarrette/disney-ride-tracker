import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export const MAX_RIDE_LOG_PHOTOS = 5;

const MAX_PHOTO_SIZE_BYTES = 20 * 1024 * 1024;

export type RideLogPhotoPickResult = {
  photos: string[];
  oversizedCount: number;
  unverifiedCount: number;
  unavailableCount: number;
};

export async function pickRideLogPhotos(
  remainingSlots: number,
): Promise<RideLogPhotoPickResult | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    mediaTypes: ['images'],
    selectionLimit: remainingSlots,
  });
  if (result.canceled) return null;

  const photos: string[] = [];
  let oversizedCount = 0;
  let unverifiedCount = 0;
  let unavailableCount = 0;
  const photoDirectory = new Directory(Paths.document, 'ride-log-photo-cache');
  photoDirectory.create({ idempotent: true, intermediates: true });

  for (const asset of result.assets) {
    if (asset.fileSize === undefined) {
      unverifiedCount += 1;
    } else if (asset.fileSize > MAX_PHOTO_SIZE_BYTES) {
      oversizedCount += 1;
    } else {
      try {
        const source = new File(asset.uri);
        const extension = source.extension || '.jpg';
        const destination = new File(
          photoDirectory,
          `photo-${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`,
        );
        await source.copy(destination);
        photos.push(destination.uri);
      } catch {
        unavailableCount += 1;
      }
    }
  }

  return { photos, oversizedCount, unverifiedCount, unavailableCount };
}
