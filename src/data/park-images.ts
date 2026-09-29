import { ImageSource } from 'expo-image';

import { Park } from '@/models/ride';

type ParkImage = {
  alt: string | null;
  source: ImageSource | null;
};

const parkImages: Record<Park, ParkImage> = {
  [Park.MagicKingdom]: {
    alt: 'Cinderella Castle lit by fireworks',
    source: require('../../assets/images/magic-kingdom/park-header.jpg'),
  },
  [Park.Epcot]: {
    alt: 'Spaceship Earth illuminated at EPCOT',
    source: require('../../assets/images/epcot/park-header.jpg'),
  },
  [Park.AnimalKingdom]: {
    alt: "The Tree of Life at Disney's Animal Kingdom",
    source: require('../../assets/images/animal-kingdom/park-header.jpg'),
  },
  [Park.HollywoodStudios]: {
    alt: 'The Twilight Zone Tower of Terror',
    source: require('../../assets/images/hollywood-studios/rides/tower-of-terror-background.jpg'),
  },
  [Park.DisneylandPark]: {
    alt: null,
    source: null,
  },
  [Park.DisneyCaliforniaAdventure]: {
    alt: null,
    source: null,
  },
};

export const getParkImage = (park: Park): ParkImage => parkImages[park];
