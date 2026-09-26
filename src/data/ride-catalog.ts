import { Park, type Ride } from '@/models/ride';
import { supabase } from './supabase';

type RideRow = {
  id: string;
  name: string;
  park: string;
  land: string;
  logo_path: string | null;
  background_path: string | null;
  attraction_type: Ride['attractionType'];
  duration_minutes: number | null;
  minimum_height_inches: number | null;
  maximum_height_inches: number | null;
  ages: Ride['ages'];
  thrill_types: Ride['thrillTypes'];
  accessibility: Ride['accessibility'];
  warnings: Ride['warnings'];
  description: string;
  photo_pass: boolean;
  lightning_lane: boolean;
  latitude: number | null;
  longitude: number | null;
  official_url: string | null;
  seasonal: boolean;
  opening_date: string | null;
  created_at: string;
  updated_at: string;
};

const getImageUrl = (path: string | null) => {
  if (!path || !supabase) return null;
  return supabase.storage.from('ride-images').getPublicUrl(path).data.publicUrl;
};

export async function fetchRideCatalog(): Promise<Ride[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .order('name');

  if (error) throw error;

  return (data as unknown as RideRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    park: row.park as Park,
    land: row.land as Ride['land'],
    logoUrl: getImageUrl(row.logo_path),
    backgroundUrl: getImageUrl(row.background_path),
    attractionType: row.attraction_type,
    durationMinutes: row.duration_minutes,
    minimumHeightInches: row.minimum_height_inches,
    maximumHeightInches: row.maximum_height_inches,
    ages: row.ages,
    thrillTypes: row.thrill_types,
    accessibility: row.accessibility,
    warnings: row.warnings,
    description: row.description,
    photoPass: row.photo_pass,
    lightningLane: row.lightning_lane,
    latitude: row.latitude,
    longitude: row.longitude,
    officialUrl: row.official_url,
    seasonal: row.seasonal,
    openingDate: row.opening_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
