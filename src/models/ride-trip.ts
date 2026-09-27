export interface RideTrip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export type RideTripInput = Pick<RideTrip, 'name' | 'startDate' | 'endDate'>;

export function getRideTripForDate(trips: RideTrip[], date: Date) {
  const visitedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  return (
    [...trips]
      .filter(
        (trip) => trip.startDate <= visitedDate && visitedDate <= trip.endDate,
      )
      .sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      )[0] ?? null
  );
}
