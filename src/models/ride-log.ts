export interface RideLog {
  id: string;
  rideId: string;
  tripId: string | null;
  visitedAt: string;
  waitTimeMinutes: number | null;
  notes: string;
  photoUrl: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}
