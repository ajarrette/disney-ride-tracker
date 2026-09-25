import { ImageSource } from 'expo-image';

import { Park } from '@/models/ride';

const rideLogos: Partial<Record<Park, Record<string, ImageSource>>> = {
  [Park.MagicKingdom]: {
    'big-thunder-mountain-railroad-logo.avif': require('../../assets/images/magic-kingdom/rides/big-thunder-mountain-railroad-logo.avif'),
    'haunted-mansion-logo.avif': require('../../assets/images/magic-kingdom/rides/haunted-mansion-logo.avif'),
    'tron-lightcycle-logo.avif': require('../../assets/images/magic-kingdom/rides/tron-lightcycle-logo.avif'),
  },
  [Park.AnimalKingdom]: {},
  [Park.HollywoodStudios]: {
    'rise-of-the-resistance-logo.avif': require('../../assets/images/hollywood-studios/rides/rise-of-the-resistance-logo.avif'),
  },
  [Park.Epcot]: {
    'guardians-of-the-galaxy-cosmic-rewind-logo.avif': require('../../assets/images/epcot/rides/guardians-of-the-galaxy-cosmic-rewind-logo.avif'),
  },
};

const rideBackgrounds: Partial<Record<Park, Record<string, ImageSource>>> = {
  [Park.MagicKingdom]: {
    'haunted-mansion-background.avif': require('../../assets/images/magic-kingdom/rides/haunted-mansion-background.avif'),
    'big-thunder-mountain-railroad-background.avif': require('../../assets/images/magic-kingdom/rides/big-thunder-mountain-railroad-background.avif'),
    'tron-lightcycle-background.webp': require('../../assets/images/magic-kingdom/rides/tron-lightcycle-background.webp'),
  },
  [Park.AnimalKingdom]: {
    'avatar-flight-of-passage-background.avif': require('../../assets/images/animal-kingdom/rides/avatar-flight-of-passage-background.avif'),
  },
  [Park.HollywoodStudios]: {
    'rise-of-the-resistance-background.avif': require('../../assets/images/hollywood-studios/rides/rise-of-the-resistance-background.avif'),
  },
  [Park.Epcot]: {
    'guardians-of-the-galaxy-cosmic-rewind-background.webp': require('../../assets/images/epcot/rides/guardians-of-the-galaxy-cosmic-rewind-background.webp'),
  },
};

export const getRideLogo = (
  park: Park,
  logoUrl: string | null,
): ImageSource | null =>
  logoUrl ? (rideLogos[park]?.[logoUrl] ?? null) : null;

export const getRideBackground = (
  park: Park,
  backgroundUrl: string | null,
): ImageSource | null =>
  backgroundUrl ? (rideBackgrounds[park]?.[backgroundUrl] ?? null) : null;
