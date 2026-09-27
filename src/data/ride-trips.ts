import { supabase } from '@/data/supabase';
import { RideTrip, RideTripInput } from '@/models/ride-trip';

type RideTripRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const toRideTrip = (row: RideTripRow): RideTrip => ({
  id: row.id,
  name: row.name,
  startDate: row.start_date,
  endDate: row.end_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function fetchRideTrips() {
  const { data, error } = await requireSupabase()
    .from('user_trips')
    .select('id, name, start_date, end_date, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RideTripRow[]).map(toRideTrip);
}

export async function createRideTrip(input: RideTripInput) {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign in to save trips.');

  const id = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await client
    .from('user_trips')
    .insert({
      user_id: authData.user.id,
      id,
      name: input.name.trim(),
      start_date: input.startDate,
      end_date: input.endDate,
    })
    .select('id, name, start_date, end_date, created_at, updated_at')
    .single();
  if (error) throw error;
  return toRideTrip(data as RideTripRow);
}

export async function updateRideTrip(trip: RideTrip) {
  const { data, error } = await requireSupabase()
    .from('user_trips')
    .update({
      name: trip.name.trim(),
      start_date: trip.startDate,
      end_date: trip.endDate,
    })
    .eq('id', trip.id)
    .select('id, name, start_date, end_date, created_at, updated_at')
    .single();
  if (error) throw error;
  return toRideTrip(data as RideTripRow);
}
