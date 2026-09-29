import { AgeGroup, type Ride } from '@/models/ride';

type SeedRide = Pick<
  Ride,
  'id' | 'name' | 'park' | 'land' | 'attractionType' | 'description'
> &
  Partial<Ride>;

const seedTimestamp = '2026-09-23T00:00:00.000Z';

export const createSeedRide = (ride: SeedRide): Ride => ({
  logoUrl: null,
  backgroundUrl: null,
  durationMinutes: null,
  minimumHeightInches: null,
  maximumHeightInches: null,
  ages: [AgeGroup.AllAges],
  thrillTypes: [],
  accessibility: [],
  warnings: [],
  photoPass: false,
  lightningLane: false,
  latitude: null,
  longitude: null,
  officialUrl: null,
  seasonal: false,
  openingDate: null,
  createdAt: seedTimestamp,
  updatedAt: seedTimestamp,
  ...ride,
});
