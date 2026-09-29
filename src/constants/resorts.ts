import { Park } from '@/models/ride';

export const ResortOptions = [
  { id: 'all', label: 'All', parks: null },
  {
    id: 'orlando',
    label: 'Walt Disney World',
    parks: new Set<Park>([
      Park.MagicKingdom,
      Park.Epcot,
      Park.HollywoodStudios,
      Park.AnimalKingdom,
    ]),
  },
  {
    id: 'anaheim',
    label: 'Disneyland Resort',
    parks: new Set<Park>([Park.DisneylandPark, Park.DisneyCaliforniaAdventure]),
  },
] as const;

export type ResortScopeId = (typeof ResortOptions)[number]['id'];
