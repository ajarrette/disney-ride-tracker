import { Park } from '@/models/ride';

const themeParksParkIds: Record<Park, string> = {
  [Park.MagicKingdom]: '75ea578a-adc8-4116-a54d-dccb60765ef9',
  [Park.Epcot]: '47f90d2c-e191-4239-a466-5892ef59a88b',
  [Park.HollywoodStudios]: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
  [Park.AnimalKingdom]: '1c84a229-8862-4648-9c71-378ddd2c7693',
};

export type WaitTrend = 'lower' | 'higher';

export type RideLiveData = {
  status: string;
  waitTime: number | null;
  yesterdayWaitTime: number | null;
  forecastedWaitTimes: (number | null)[];
  operatingHours: RideOperatingHour[];
  waitTrend?: WaitTrend;
};

export type RideOperatingHour = {
  type: string;
  startTime: string;
  endTime: string;
};

type LiveDataEntity = {
  name?: unknown;
  entityType?: unknown;
  status?: unknown;
  queue?: {
    STANDBY?: {
      waitTime?: unknown;
    };
  };
  operatingHours?: unknown;
};

type HistoricalSnapshot = {
  time?: unknown;
  observedAt?: unknown;
  changed?: unknown;
  queue?: {
    STANDBY?: {
      waitTime?: unknown;
    };
  };
};

type HistoricalEntity = {
  name?: unknown;
  entityType?: unknown;
  opening?: HistoricalSnapshot;
  history?: unknown;
};

const parkTimeZone = 'America/New_York';
const parkTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: parkTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const parkHistoryCache = new Map<string, Promise<HistoricalEntity[]>>();

function getParkTimeParts(date: Date) {
  const parts = Object.fromEntries(
    parkTimeFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hourOfDay: Number(parts.hour),
    minuteOfDay: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function getPreviousParkDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1))
    .toISOString()
    .slice(0, 10);
}

function isHistoricalEntity(value: unknown): value is HistoricalEntity {
  return typeof value === 'object' && value !== null;
}

function fetchParkHistory(
  park: Park,
  date: string,
): Promise<HistoricalEntity[]> {
  const cacheKey = `${park}:${date}`;
  const cachedHistory = parkHistoryCache.get(cacheKey);
  if (cachedHistory) return cachedHistory;

  const historyPromise = fetch(
    `https://api.themeparks.wiki/v1/entity/${themeParksParkIds[park]}/history?date=${date}`,
  )
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('ThemeParks.wiki history rate limit exceeded.');
        } else {
          console.warn(
            `ThemeParks.wiki history request failed: ${response.status}`,
          );
        }
        return [];
      }

      const payload: { entities?: unknown } = await response.json();
      return Array.isArray(payload.entities)
        ? payload.entities.filter(isHistoricalEntity)
        : [];
    })
    .catch((error) => {
      console.warn('Unable to load ThemeParks.wiki ride history.', error);
      return [];
    });

  parkHistoryCache.set(cacheKey, historyPromise);
  return historyPromise;
}

function getHistoricalWaitTime(
  entity: HistoricalEntity | undefined,
  date: string,
  minuteOfDay: number,
): number | null {
  if (!entity) return null;

  let waitTime: number | null = null;
  const opening = entity.opening;
  if (typeof opening?.observedAt === 'string') {
    const observedAt = getParkTimeParts(new Date(opening.observedAt));
    const openingWaitTime = opening.queue?.STANDBY?.waitTime;
    if (
      observedAt.date === date &&
      observedAt.minuteOfDay <= minuteOfDay &&
      typeof openingWaitTime === 'number'
    ) {
      waitTime = openingWaitTime;
    }
  }

  if (!Array.isArray(entity.history)) return waitTime;

  for (const snapshot of entity.history as HistoricalSnapshot[]) {
    if (
      typeof snapshot.time !== 'string' ||
      !Array.isArray(snapshot.changed) ||
      !snapshot.changed.includes('queue.STANDBY.waitTime')
    ) {
      continue;
    }

    const snapshotTime = getParkTimeParts(new Date(snapshot.time));
    if (snapshotTime.date !== date || snapshotTime.minuteOfDay > minuteOfDay) {
      continue;
    }

    const snapshotWaitTime = snapshot.queue?.STANDBY?.waitTime;
    waitTime = typeof snapshotWaitTime === 'number' ? snapshotWaitTime : null;
  }

  return waitTime;
}

function getHistoricalWaitSamplesByHour(
  entity: HistoricalEntity | undefined,
  date: string,
): number[][] {
  const samplesByHour = Array.from({ length: 24 }, () => [] as number[]);
  if (!entity) return samplesByHour;

  const addSample = (time: unknown, waitTime: unknown) => {
    if (
      typeof time !== 'string' ||
      typeof waitTime !== 'number' ||
      !Number.isFinite(waitTime)
    ) {
      return;
    }

    const timestamp = new Date(time);
    if (Number.isNaN(timestamp.getTime())) return;

    const { date: sampleDate, hourOfDay } = getParkTimeParts(timestamp);
    if (sampleDate !== date) return;
    samplesByHour[hourOfDay].push(waitTime);
  };

  addSample(
    entity.opening?.observedAt,
    entity.opening?.queue?.STANDBY?.waitTime,
  );

  if (Array.isArray(entity.history)) {
    for (const snapshot of entity.history as HistoricalSnapshot[]) {
      if (
        typeof snapshot.time === 'string' &&
        Array.isArray(snapshot.changed) &&
        snapshot.changed.includes('queue.STANDBY.waitTime')
      ) {
        addSample(snapshot.time, snapshot.queue?.STANDBY?.waitTime);
      }
    }
  }

  return samplesByHour;
}

function getForecastedWaitTimes(
  entitiesByDay: (HistoricalEntity | undefined)[],
  dates: string[],
): (number | null)[] {
  const dailyAveragesByHour = Array.from({ length: 24 }, () => [] as number[]);

  entitiesByDay.forEach((entity, dayIndex) => {
    const samplesByHour = getHistoricalWaitSamplesByHour(
      entity,
      dates[dayIndex],
    );
    samplesByHour.forEach((samples, hour) => {
      if (samples.length > 0) {
        dailyAveragesByHour[hour].push(
          samples.reduce((total, sample) => total + sample, 0) / samples.length,
        );
      }
    });
  });

  return dailyAveragesByHour.map((dailyAverages) =>
    dailyAverages.length > 0
      ? dailyAverages.reduce((total, average) => total + average, 0) /
        dailyAverages.length
      : null,
  );
}

function isRideOperatingHour(value: unknown): value is RideOperatingHour {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const hour = value as Record<string, unknown>;
  return (
    typeof hour.type === 'string' &&
    typeof hour.startTime === 'string' &&
    typeof hour.endTime === 'string'
  );
}

export function normalizeRideName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function fetchParkLiveData(
  park: Park,
): Promise<Record<string, RideLiveData>> {
  const now = new Date();
  const currentParkTime = getParkTimeParts(now);
  const historyDates = Array.from({ length: 7 }, (_, index) => {
    let date = currentParkTime.date;
    for (let daysAgo = 0; daysAgo <= index; daysAgo += 1) {
      date = getPreviousParkDate(date);
    }
    return date;
  });
  const [response, historyByDate] = await Promise.all([
    fetch(
      `https://api.themeparks.wiki/v1/entity/${themeParksParkIds[park]}/live`,
    ),
    Promise.all(historyDates.map((date) => fetchParkHistory(park, date))),
  ]);

  if (!response.ok) {
    throw new Error(`ThemeParks.wiki request failed: ${response.status}`);
  }

  const payload: { liveData?: unknown } = await response.json();

  if (!Array.isArray(payload.liveData)) {
    throw new Error('ThemeParks.wiki response did not include live data.');
  }

  const historyByRideByDate = historyByDate.map((entities) => {
    const historyByRide: Record<string, HistoricalEntity> = {};
    for (const entity of entities) {
      if (
        typeof entity.name === 'string' &&
        entity.entityType === 'ATTRACTION'
      ) {
        historyByRide[normalizeRideName(entity.name)] = entity;
      }
    }
    return historyByRide;
  });

  const rides: Record<string, RideLiveData> = {};

  for (const entity of payload.liveData as LiveDataEntity[]) {
    if (
      typeof entity.name !== 'string' ||
      entity.entityType !== 'ATTRACTION' ||
      typeof entity.status !== 'string'
    ) {
      continue;
    }

    const waitTime = entity.queue?.STANDBY?.waitTime;
    const operatingHours = Array.isArray(entity.operatingHours)
      ? entity.operatingHours.filter(isRideOperatingHour)
      : [];
    const normalizedName = normalizeRideName(entity.name);
    const historyForRide = historyByRideByDate.map(
      (historyByRide) => historyByRide[normalizedName],
    );
    const historicalWaitTime = getHistoricalWaitTime(
      historyForRide[0],
      historyDates[0],
      currentParkTime.minuteOfDay,
    );
    rides[normalizeRideName(entity.name)] = {
      status: entity.status,
      waitTime: typeof waitTime === 'number' ? waitTime : null,
      yesterdayWaitTime: historicalWaitTime,
      forecastedWaitTimes: getForecastedWaitTimes(historyForRide, historyDates),
      operatingHours,
      waitTrend:
        typeof waitTime === 'number' && historicalWaitTime !== null
          ? waitTime < historicalWaitTime
            ? 'lower'
            : waitTime > historicalWaitTime
              ? 'higher'
              : undefined
          : undefined,
    };
  }

  return rides;
}
