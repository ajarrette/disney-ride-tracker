import { existsSync, writeFileSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { seedRides } from '@/data/rides';
import { Park } from '@/models/ride';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const parkFolders: Record<Park, string> = {
  [Park.MagicKingdom]: 'magic-kingdom',
  [Park.Epcot]: 'epcot',
  [Park.HollywoodStudios]: 'hollywood-studios',
  [Park.AnimalKingdom]: 'animal-kingdom',
};

const quote = (value: string | null): string =>
  value === null ? 'null' : `'${value.replaceAll("'", "''")}'`;

const sqlArray = (values: string[]): string =>
  values.length === 0
    ? 'array[]::text[]'
    : `array[${values.map((value) => quote(value)).join(', ')}]::text[]`;

function getLogoFilename(logoUrl: string | null, backgroundUrl: string | null) {
  if (logoUrl) return logoUrl;
  if (!backgroundUrl) return null;

  return `${parse(backgroundUrl).name.replace(/-background$/, '')}-logo.jpg`;
}

function getImagePath(
  park: Park,
  imageFilename: string | null,
  rideId: string,
  imageType: string,
) {
  if (!imageFilename) return null;

  const parkFolder = parkFolders[park];
  const localPath = resolve(
    projectRoot,
    'assets/images',
    parkFolder,
    'rides',
    imageFilename,
  );

  if (!existsSync(localPath)) {
    throw new Error(`Missing ${imageType} image for ${rideId}: ${localPath}`);
  }

  return `${parkFolder}/rides/${imageFilename}`;
}

const columns = [
  'id',
  'name',
  'park',
  'land',
  'logo_path',
  'background_path',
  'attraction_type',
  'duration_minutes',
  'minimum_height_inches',
  'maximum_height_inches',
  'ages',
  'thrill_types',
  'accessibility',
  'warnings',
  'description',
  'photo_pass',
  'lightning_lane',
  'latitude',
  'longitude',
  'official_url',
  'seasonal',
  'opening_date',
];

const rows = seedRides.map((ride) => {
  const logoFilename = getLogoFilename(ride.logoUrl, ride.backgroundUrl);
  const logoPath = getImagePath(ride.park, logoFilename, ride.id, 'logo');
  const backgroundPath = getImagePath(
    ride.park,
    ride.backgroundUrl,
    ride.id,
    'background',
  );
  const values = [
    quote(ride.id),
    quote(ride.name),
    quote(ride.park),
    quote(ride.land),
    quote(logoPath),
    quote(backgroundPath),
    quote(ride.attractionType),
    ride.durationMinutes ?? 'null',
    ride.minimumHeightInches ?? 'null',
    ride.maximumHeightInches ?? 'null',
    sqlArray(ride.ages),
    sqlArray(ride.thrillTypes),
    sqlArray(ride.accessibility),
    sqlArray(ride.warnings),
    quote(ride.description),
    ride.photoPass,
    ride.lightningLane,
    ride.latitude ?? 'null',
    ride.longitude ?? 'null',
    quote(ride.officialUrl),
    ride.seasonal,
    quote(ride.openingDate),
  ];

  return `(${values.join(', ')})`;
});

const updateColumns = columns
  .slice(1)
  .map((column) => `${column} = excluded.${column}`)
  .join(',\n  ');
const sql = `begin;\n\ninsert into public.rides (${columns.join(', ')})\nvalues\n  ${rows.join(',\n  ')}\non conflict (id) do update set\n  ${updateColumns};\n\ncommit;\n`;
const outputPath = resolve(projectRoot, 'supabase/seed.sql');

writeFileSync(outputPath, sql);
console.log(`Generated ${seedRides.length} ride rows at ${outputPath}`);
