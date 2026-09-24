export enum Park {
  MagicKingdom = 'magic_kingdom',
  Epcot = 'epcot',
  HollywoodStudios = 'hollywood_studios',
  AnimalKingdom = 'animal_kingdom',
}

export enum Land {
  MainStreetUSA = 'main_street_usa',
  Tomorrowland = 'tomorrowland',
  Fantasyland = 'fantasyland',
  LibertySquare = 'liberty_square',
  Adventureland = 'adventureland',
  Frontierland = 'frontierland',
  WorldCelebration = 'world_celebration',
  WorldDiscovery = 'world_discovery',
  WorldNature = 'world_nature',
  WorldShowcase = 'world_showcase',
  HollywoodBoulevard = 'hollywood_boulevard',
  EchoLake = 'echo_lake',
  GrandAvenue = 'grand_avenue',
  StarWarsGalaxysEdge = 'star_wars_galaxys_edge',
  ToyStoryLand = 'toy_story_land',
  WaltDisneyStudiosLot = 'walt_disney_studios_lot',
  SunsetBoulevard = 'sunset_boulevard',
  Oasis = 'oasis',
  DiscoveryIsland = 'discovery_island',
  Africa = 'africa',
  ConservationStation = 'conservation_station',
  Asia = 'asia',
  PandoraWorldOfAvatar = 'pandora_world_of_avatar',
}

export enum AgeGroup {
  AllAges = 'all_ages',
  Adults = 'adults',
  Teens = 'teens',
  Tweens = 'tweens',
  Kids = 'kids',
  Preschoolers = 'preschoolers',
}

export enum ThrillType {
  ThrillRide = 'thrill_ride',
  BigDrops = 'big_drops',
  SmallDrops = 'small_drops',
  Dark = 'dark',
  Loud = 'loud',
  Spinning = 'spinning',
  SlowRides = 'slow_rides',
  Scary = 'scary',
}

export enum AttractionType {
  Ride = 'ride',
  Show = 'show',
  CharacterMeet = 'character_meet',
  PlayArea = 'play_area',
  Transportation = 'transportation',
}

export enum AccessibilityFeature {
  WheelchairTransfer = 'wheelchair_transfer',
  WheelchairRide = 'wheelchair_ride',
  ServiceAnimal = 'service_animal',
  AudioDescription = 'audio_description',
}

export enum RideWarning {
  MotionSimulation = 'motion_simulation',
  Darkness = 'darkness',
  LoudSounds = 'loud_sounds',
  FlashingLights = 'flashing_lights',
  Water = 'water',
  Scary = 'scary',
}

export interface Ride {
  id: string;
  name: string;
  park: Park;
  land: Land;
  logoUrl: string | null;
  backgroundUrl: string | null;
  attractionType: AttractionType;
  durationMinutes: number | null;
  minimumHeightInches: number | null;
  maximumHeightInches: number | null;
  ages: AgeGroup[];
  thrillTypes: ThrillType[];
  accessibility: AccessibilityFeature[];
  warnings: RideWarning[];
  description: string;
  photoPass: boolean;
  lightningLane: boolean;
  latitude: number | null;
  longitude: number | null;
  officialUrl: string | null;
  seasonal: boolean;
  openingDate: string | null;
  createdAt: string;
  updatedAt: string;
}
