import { Park } from '@/models/ride';

const themeParksParkIds: Record<Park, string> = {
  [Park.MagicKingdom]: '75ea578a-adc8-4116-a54d-dccb60765ef9',
  [Park.Epcot]: '47f90d2c-e191-4239-a466-5892ef59a88b',
  [Park.HollywoodStudios]: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
  [Park.AnimalKingdom]: '1c84a229-8862-4648-9c71-378ddd2c7693',
};

export type RideLiveData = {
  status: string;
  waitTime: number | null;
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
};

export function normalizeRideName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function fetchParkLiveData(
  park: Park,
): Promise<Record<string, RideLiveData>> {
  const response = await fetch(
    `https://api.themeparks.wiki/v1/entity/${themeParksParkIds[park]}/live`,
  );

  if (!response.ok) {
    throw new Error(`ThemeParks.wiki request failed: ${response.status}`);
  }

  const payload: { liveData?: unknown } = await response.json();

  if (!Array.isArray(payload.liveData)) {
    throw new Error('ThemeParks.wiki response did not include live data.');
  }

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
    rides[normalizeRideName(entity.name)] = {
      status: entity.status,
      waitTime: typeof waitTime === 'number' ? waitTime : null,
    };
  }

  return rides;
}
