import { LandLabels, ParkLabels } from '@/constants/ride-labels';
import { Ride } from '@/models/ride';

const formatLabel = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function searchRideCatalog(rides: Ride[], query: string): Ride[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];

  return rides
    .map((ride) => ({
      ride,
      searchText: [
        ride.name,
        ParkLabels[ride.park],
        formatLabel(ride.attractionType),
        ...ride.warnings.map(formatLabel),
        LandLabels[ride.land],
      ]
        .join(' ')
        .toLocaleLowerCase(),
    }))
    .filter(({ searchText }) => searchText.includes(normalizedQuery))
    .sort((first, second) => first.ride.name.localeCompare(second.ride.name))
    .map(({ ride }) => ride);
}
