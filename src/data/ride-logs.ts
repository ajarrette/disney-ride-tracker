import { File } from 'expo-file-system';

import { supabase } from '@/data/supabase';
import { RideLog } from '@/models/ride-log';

const PHOTO_BUCKET = 'ride-log-photos';
const SIGNED_URL_LIFETIME_SECONDS = 60 * 60;

type RideLogRow = {
  id: string;
  ride_id: string;
  trip_id: string | null;
  visited_at: string;
  wait_time_minutes: number | null;
  lightning_lane_used: boolean;
  notes: string;
  photo_paths: string[];
  rating: number | null;
  created_at: string;
  updated_at: string;
  client_updated_at: string;
};

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

async function getUserId() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in to save ride logs.');
  return data.user.id;
}

const uriHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0).toString(16);
};

async function createSignedPhotoUrls(paths: string[]) {
  if (paths.length === 0) return [];
  const { data, error } = await requireSupabase()
    .storage.from(PHOTO_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_LIFETIME_SECONDS);
  if (error) throw error;

  const urlsByPath = new Map(
    data.map((entry) => [entry.path, entry.signedUrl]),
  );
  const urls = paths.map((path) => urlsByPath.get(path) ?? '');
  if (urls.some((url) => !url)) {
    throw new Error('Unable to retrieve one or more ride log photos.');
  }
  return urls;
}

async function toRideLog(row: RideLogRow): Promise<RideLog> {
  const photoPaths = row.photo_paths ?? [];
  let photos: string[] = [];
  try {
    photos = await createSignedPhotoUrls(photoPaths);
  } catch {
    photos = photoPaths.map(() => '');
  }
  return {
    id: row.id,
    rideId: row.ride_id,
    tripId: row.trip_id,
    visitedAt: row.visited_at,
    waitTimeMinutes: row.wait_time_minutes,
    lightningLaneUsed: row.lightning_lane_used,
    notes: row.notes,
    photoPaths,
    photos,
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.client_updated_at,
  };
}

async function uploadNewPhotos(userId: string, rideLog: RideLog) {
  const oldPhotos = rideLog.photos ?? [];
  const oldPaths = rideLog.photoPaths ?? [];
  const photoPaths: string[] = [];
  const uploadedPaths: string[] = [];

  for (let index = 0; index < oldPhotos.length; index += 1) {
    const photo = oldPhotos[index];
    const existingPath = oldPaths[index];
    if (
      existingPath &&
      !photo.startsWith('file:') &&
      !photo.startsWith('content:')
    ) {
      photoPaths.push(existingPath);
      continue;
    }

    if (!photo.startsWith('file:') && !photo.startsWith('content:')) continue;

    const file = new File(photo);
    if (!file.exists)
      throw new Error('A selected photo is no longer available.');
    const extension = file.extension.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
    const path = `${userId}/${rideLog.id}/${uriHash(photo)}.${extension}`;
    const { error } = await requireSupabase()
      .storage.from(PHOTO_BUCKET)
      .upload(path, await file.bytes(), {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });
    if (error) throw error;

    photoPaths.push(path);
    uploadedPaths.push(path);
  }

  return { photoPaths, uploadedPaths };
}

export async function fetchRideLogs() {
  const { data, error } = await requireSupabase()
    .from('ride_logs')
    .select(
      'id, ride_id, trip_id, visited_at, wait_time_minutes, lightning_lane_used, notes, photo_paths, rating, created_at, updated_at, client_updated_at',
    )
    .order('visited_at', { ascending: false });
  if (error) throw error;
  const rows = data as RideLogRow[];
  const allPhotoPaths = [
    ...new Set(rows.flatMap((row) => row.photo_paths ?? [])),
  ];
  let signedUrls: string[] = [];
  try {
    signedUrls = await createSignedPhotoUrls(allPhotoPaths);
  } catch {
    signedUrls = allPhotoPaths.map(() => '');
  }
  const urlsByPath = new Map(
    allPhotoPaths.map((path, index) => [path, signedUrls[index]]),
  );

  const rideLogs: RideLog[] = rows.map((row) => ({
    id: row.id,
    rideId: row.ride_id,
    tripId: row.trip_id,
    visitedAt: row.visited_at,
    waitTimeMinutes: row.wait_time_minutes,
    lightningLaneUsed: row.lightning_lane_used,
    notes: row.notes,
    photoPaths: row.photo_paths ?? [],
    photos: (row.photo_paths ?? []).map((path) => urlsByPath.get(path) ?? ''),
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.client_updated_at,
  }));
  return rideLogs;
}

export async function saveRideLog(
  rideLog: RideLog,
  previousPhotoPaths: string[] = [],
) {
  const client = requireSupabase();
  const userId = await getUserId();
  const { photoPaths, uploadedPaths } = await uploadNewPhotos(userId, rideLog);
  const { data, error } = await client
    .from('ride_logs')
    .upsert(
      {
        user_id: userId,
        id: rideLog.id,
        ride_id: rideLog.rideId,
        trip_id: rideLog.tripId,
        visited_at: rideLog.visitedAt,
        wait_time_minutes: rideLog.waitTimeMinutes,
        lightning_lane_used: rideLog.lightningLaneUsed ?? false,
        notes: rideLog.notes,
        photo_paths: photoPaths,
        rating: rideLog.rating,
        created_at: rideLog.createdAt,
        updated_at: rideLog.updatedAt,
        client_updated_at: rideLog.updatedAt,
      },
      { onConflict: 'user_id,id' },
    )
    .select(
      'id, ride_id, trip_id, visited_at, wait_time_minutes, lightning_lane_used, notes, photo_paths, rating, created_at, updated_at, client_updated_at',
    )
    .single();

  if (error) {
    if (uploadedPaths.length > 0) {
      await client.storage.from(PHOTO_BUCKET).remove(uploadedPaths);
    }
    throw error;
  }

  const savedRow = data as RideLogRow;
  if (Date.parse(savedRow.client_updated_at) > Date.parse(rideLog.updatedAt)) {
    return {
      rideLog: await toRideLog(savedRow),
      removedPhotoPaths: uploadedPaths,
    };
  }

  let photos: string[];
  try {
    photos = await createSignedPhotoUrls(photoPaths);
  } catch {
    photos = rideLog.photos ?? [];
  }
  return {
    rideLog: {
      ...rideLog,
      photoPaths,
      photos,
      updatedAt: savedRow.client_updated_at,
    },
    removedPhotoPaths: previousPhotoPaths.filter(
      (path) => !photoPaths.includes(path),
    ),
  };
}

export async function deleteRideLog(logId: string) {
  const client = requireSupabase();
  const userId = await getUserId();
  const { error } = await client
    .from('ride_logs')
    .delete()
    .eq('user_id', userId)
    .eq('id', logId);
  if (error) throw error;
}

export async function deleteRideLogPhotos(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await requireSupabase()
    .storage.from(PHOTO_BUCKET)
    .remove(paths);
  if (error) throw error;
}

export function deleteCachedRideLogPhotos(uris: string[]) {
  uris.forEach((uri) => {
    if (
      (uri.startsWith('file:') || uri.startsWith('content:')) &&
      uri.includes('/ride-log-photo-cache/')
    ) {
      new File(uri).delete();
    }
  });
}
