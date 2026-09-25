import { ImageSource } from 'expo-image';

import { Park } from '@/models/ride';

const rideLogos: Partial<Record<Park, Record<string, ImageSource>>> = {
  [Park.MagicKingdom]: {
    'big-thunder-mountain-railroad-logo.avif': require('../../assets/images/magic-kingdom/rides/big-thunder-mountain-railroad-logo.avif'),
    'haunted-mansion-logo.avif': require('../../assets/images/magic-kingdom/rides/haunted-mansion-logo.avif'),
  },
};

const rideBackgrounds: Partial<Record<Park, Record<string, ImageSource>>> = {
  [Park.MagicKingdom]: {
    'haunted-mansion-background.avif': require('../../assets/images/magic-kingdom/rides/haunted-mansion-background.avif'),
    'big-thunder-mountain-railroad-background.avif': require('../../assets/images/magic-kingdom/rides/big-thunder-mountain-railroad-background.avif'),
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
