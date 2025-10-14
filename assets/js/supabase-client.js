// ضع هنا URL و ANON KEY الخاص بمشروع Supabase
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'PUBLIC-ANON-KEY';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchBookingsByDate(date){
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('day_date', date)
    .neq('status', 'completed')
    .order('time_slot', {ascending:true});
  if(error) throw error;
  return data;
}

export function realtimeSubscribeBookings(callback){
  return supabase
    .channel('public:bookings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => callback(payload))
    .subscribe();
}
