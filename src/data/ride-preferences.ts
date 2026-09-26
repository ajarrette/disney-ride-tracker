import { supabase } from '@/data/supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

async function getUserId() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in to save ride preferences.');
  return data.user.id;
}

export async function fetchPinnedRideIds() {
  const { data, error } = await requireSupabase()
    .from('user_ride_preferences')
    .select('ride_id')
    .eq('is_pinned', true);
  if (error) throw error;
  return data.map((preference) => preference.ride_id as string);
}

export async function saveRidePin(rideId: string, isPinned: boolean) {
  const client = requireSupabase();
  const userId = await getUserId();
  const { error } = await client.from('user_ride_preferences').upsert(
    {
      user_id: userId,
      ride_id: rideId,
      is_pinned: isPinned,
    },
    { onConflict: 'user_id,ride_id' },
  );
  if (error) throw error;
}
