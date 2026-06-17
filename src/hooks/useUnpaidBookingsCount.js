import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

/**
 * Returns the count of active bookings where the reservation fee has been paid
 * but the final balance is still outstanding (to be settled with driver after trip).
 */
export function useUnpaidBookingsCount() {
  const { user } = useAuthContext();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) { setCount(0); return; }

    const load = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('payment_status', 'reservation_paid')
        .neq('status', 'cancelled')
        .neq('status', 'completed');

      if (!error && data) setCount(data.length);
    };

    load();

    // Realtime subscription so badge updates instantly
    const channel = supabase
      .channel('unpaid-bookings-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return count;
}
