import { Land, Park } from '@/models/ride';

export const ParkLabels: Record<Park, string> = {
  [Park.MagicKingdom]: 'Magic Kingdom',
  [Park.Epcot]: 'EPCOT',
  [Park.HollywoodStudios]: 'Hollywood Studios',
  [Park.AnimalKingdom]: 'Animal Kingdom',
};

export const LandLabels: Record<Land, string> = {
  [Land.MainStreetUSA]: 'Main Street, U.S.A.',
  [Land.Tomorrowland]: 'Tomorrowland',
  [Land.Fantasyland]: 'Fantasyland',
  [Land.LibertySquare]: 'Liberty Square',
  [Land.Adventureland]: 'Adventureland',
  [Land.Frontierland]: 'Frontierland',
  [Land.WorldCelebration]: 'World Celebration',
  [Land.WorldDiscovery]: 'World Discovery',
  [Land.WorldNature]: 'World Nature',
  [Land.WorldShowcase]: 'World Showcase',
  [Land.HollywoodBoulevard]: 'Hollywood Boulevard',
  [Land.EchoLake]: 'Echo Lake',
  [Land.GrandAvenue]: 'Grand Avenue',
  [Land.StarWarsGalaxysEdge]: "Star Wars: Galaxy's Edge",
  [Land.ToyStoryLand]: 'Toy Story Land',
  [Land.WaltDisneyStudiosLot]: 'The Walt Disney Studios Lot',
  [Land.SunsetBoulevard]: 'Sunset Boulevard',
  [Land.Oasis]: 'Oasis',
  [Land.DiscoveryIsland]: 'Discovery Island',
  [Land.Africa]: 'Africa',
  [Land.ConservationStation]: 'Conservation Station',
  [Land.Asia]: 'Asia',
  [Land.PandoraWorldOfAvatar]: 'Pandora - The World of Avatar',
};
