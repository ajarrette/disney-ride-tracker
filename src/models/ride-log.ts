export interface RideLog {
  id: string;
  rideId: string;
  tripId: string | null;
  visitedAt: string;
  waitTimeMinutes: number | null;
  lightningLaneUsed?: boolean;
  notes: string;
  photos?: string[];
  photoUrl?: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

export const getRideLogPhotos = (rideLog: RideLog) =>
  rideLog.photos !== undefined
    ? rideLog.photos
    : rideLog.photoUrl
      ? [rideLog.photoUrl]
      : [];
