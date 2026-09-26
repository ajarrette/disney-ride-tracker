import { supabase } from '@/data/supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

export async function fetchPinnedRideIds() {
  const { data, error } = await requireSupabase()
    .from('user_ride_preferences')
    .select('ride_id, pinned_order')
    .eq('is_pinned', true)
    .order('pinned_order', { ascending: true });
  if (error) throw error;
  return data.map((preference) => preference.ride_id as string);
}

export async function savePinnedRideOrder(rideIds: string[]) {
  const { error } = await requireSupabase().rpc('save_pinned_ride_order', {
    p_ride_ids: rideIds,
  });
  if (error) throw error;
}
