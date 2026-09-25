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
    'space-mountain-background.jpg': require('../../assets/images/magic-kingdom/rides/space-mountain-background.jpg'),
    'pirates-of-the-caribbean-background.jpg': require('../../assets/images/magic-kingdom/rides/pirates-of-the-caribbean-background.jpg'),
    'seven-dwarfs-mine-train-background.jpg': require('../../assets/images/magic-kingdom/rides/seven-dwarfs-mine-train-background.jpg'),
    'tianas-bayou-adventure-background.jpg': require('../../assets/images/magic-kingdom/rides/tianas-bayou-adventure-background.jpg'),
    'jungle-cruise-background.jpg': require('../../assets/images/magic-kingdom/rides/jungle-cruise-background.jpg'),
    'peter-pans-flight-background.jpg': require('../../assets/images/magic-kingdom/rides/peter-pans-flight-background.jpg'),
    'its-a-small-world-background.jpg': require('../../assets/images/magic-kingdom/rides/its-a-small-world-background.jpg'),
    'buzz-lightyears-space-ranger-spin-background.jpg': require('../../assets/images/magic-kingdom/rides/buzz-lightyears-space-ranger-spin-background.jpg'),
    'monsters-inc-laugh-floor-background.jpg': require('../../assets/images/magic-kingdom/rides/monsters-inc-laugh-floor-background.jpg'),
    'astro-orbiter-background.jpg': require('../../assets/images/magic-kingdom/rides/astro-orbiter-background.jpg'),
    'dumbo-the-flying-elephant-background.jpg': require('../../assets/images/magic-kingdom/rides/dumbo-the-flying-elephant-background.jpg'),
    'mad-tea-party-background.jpg': require('../../assets/images/magic-kingdom/rides/mad-tea-party-background.jpg'),
    'magic-carpets-of-aladdin-background.jpg': require('../../assets/images/magic-kingdom/rides/magic-carpets-of-aladdin-background.jpg'),
    'tomorrowland-transit-authority-peoplemover-background.jpg': require('../../assets/images/magic-kingdom/rides/tomorrowland-transit-authority-peoplemover-background.jpg'),
    'tomorrowland-speedway-background.jpg': require('../../assets/images/magic-kingdom/rides/tomorrowland-speedway-background.jpg'),
    'many-adventures-of-winnie-the-pooh-background.jpg': require('../../assets/images/magic-kingdom/rides/many-adventures-of-winnie-the-pooh-background.jpg'),
    'prince-charming-regal-carrousel-background.jpg': require('../../assets/images/magic-kingdom/rides/prince-charming-regal-carrousel-background.jpg'),
    'under-the-sea-journey-of-the-little-mermaid-background.jpg': require('../../assets/images/magic-kingdom/rides/under-the-sea-journey-of-the-little-mermaid-background.jpg'),
    'walt-disney-world-railroad-background.jpg': require('../../assets/images/magic-kingdom/rides/walt-disney-world-railroad-background.jpg'),
  },
  [Park.AnimalKingdom]: {
    'avatar-flight-of-passage-background.avif': require('../../assets/images/animal-kingdom/rides/avatar-flight-of-passage-background.avif'),
    'navi-river-journey-background.jpg': require('../../assets/images/animal-kingdom/rides/navi-river-journey-background.jpg'),
    'expedition-everest-background.jpg': require('../../assets/images/animal-kingdom/rides/expedition-everest-background.jpg'),
    'kilimanjaro-safaris-background.jpg': require('../../assets/images/animal-kingdom/rides/kilimanjaro-safaris-background.jpg'),
    'kali-river-rapids-background.jpg': require('../../assets/images/animal-kingdom/rides/kali-river-rapids-background.jpg'),
    'festival-of-the-lion-king-background.jpg': require('../../assets/images/animal-kingdom/rides/festival-of-the-lion-king-background.jpg'),
    'wildlife-express-train-background.jpg': require('../../assets/images/animal-kingdom/rides/wildlife-express-train-background.jpg'),
  },
  [Park.HollywoodStudios]: {
    'rise-of-the-resistance-background.avif': require('../../assets/images/hollywood-studios/rides/rise-of-the-resistance-background.avif'),
    'millennium-falcon-smugglers-run-background.jpg': require('../../assets/images/hollywood-studios/rides/millennium-falcon-smugglers-run-background.jpg'),
    'mickeys-runaway-railway-background.jpg': require('../../assets/images/hollywood-studios/rides/mickeys-runaway-railway-background.jpg'),
    'slinky-dog-dash-background.jpg': require('../../assets/images/hollywood-studios/rides/slinky-dog-dash-background.jpg'),
    'toy-story-mania-background.jpg': require('../../assets/images/hollywood-studios/rides/toy-story-mania-background.jpg'),
    'tower-of-terror-background.jpg': require('../../assets/images/hollywood-studios/rides/tower-of-terror-background.jpg'),
    'indiana-jones-epic-stunt-spectacular-background.jpg': require('../../assets/images/hollywood-studios/rides/indiana-jones-epic-stunt-spectacular-background.jpg'),
    'alien-swirling-saucers-background.jpg': require('../../assets/images/hollywood-studios/rides/alien-swirling-saucers-background.jpg'),
    'star-tours-adventures-continue-background.jpg': require('../../assets/images/hollywood-studios/rides/star-tours-adventures-continue-background.jpg'),
  },
  [Park.Epcot]: {
    'guardians-of-the-galaxy-cosmic-rewind-background.webp': require('../../assets/images/epcot/rides/guardians-of-the-galaxy-cosmic-rewind-background.webp'),
    'test-track-background.jpg': require('../../assets/images/epcot/rides/test-track-background.jpg'),
    'soarin-around-the-world-background.jpg': require('../../assets/images/epcot/rides/soarin-around-the-world-background.jpg'),
    'remys-ratatouille-adventure-background.jpg': require('../../assets/images/epcot/rides/remys-ratatouille-adventure-background.jpg'),
    'frozen-ever-after-background.jpg': require('../../assets/images/epcot/rides/frozen-ever-after-background.jpg'),
    'spaceship-earth-background.jpg': require('../../assets/images/epcot/rides/spaceship-earth-background.jpg'),
    'mission-space-background.jpg': require('../../assets/images/epcot/rides/mission-space-background.jpg'),
    'living-with-the-land-background.jpg': require('../../assets/images/epcot/rides/living-with-the-land-background.jpg'),
    'journey-into-imagination-with-figment-background.jpg': require('../../assets/images/epcot/rides/journey-into-imagination-with-figment-background.jpg'),
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
