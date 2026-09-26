import { supabase } from '@/data/supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

export async function fetchRidePreferences() {
  const { data, error } = await requireSupabase()
    .from('user_ride_preferences')
    .select('ride_id, is_pinned, pinned_order, is_hidden')
    .order('pinned_order', { ascending: true });
  if (error) throw error;
  return {
    pinnedRideOrder: data
      .filter((preference) => preference.is_pinned)
      .map((preference) => preference.ride_id as string),
    hiddenRideIds: data
      .filter((preference) => preference.is_hidden)
      .map((preference) => preference.ride_id as string),
  };
}

export async function savePinnedRideOrder(rideIds: string[]) {
  const { error } = await requireSupabase().rpc('save_pinned_ride_order', {
    p_ride_ids: rideIds,
  });
  if (error) throw error;
}

export async function saveRideHidden(rideId: string, isHidden: boolean) {
  const client = requireSupabase();
  const { data, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!data.user) throw new Error('Sign in to save ride preferences.');

  const { error } = await client.from('user_ride_preferences').upsert(
    {
      user_id: data.user.id,
      ride_id: rideId,
      is_hidden: isHidden,
    },
    { onConflict: 'user_id,ride_id' },
  );
  if (error) throw error;
}
