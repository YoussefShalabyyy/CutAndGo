import { supabase } from '@/lib/supabase';
import { Appointment } from '@/common/types';

export const appointmentsService = {
  getUserBookings: async (userId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        time,
        status,
        barbers ( name, mainImage ),
        services ( name )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);

    // Map relational data to match frontend Appointment type closely
    return data.map((item: any) => ({
      id: item.id,
      barberName: item.barbers?.name || 'Unknown',
      service: item.services?.name || 'Unknown',
      date: item.date,
      time: item.time,
      status: item.status,
      image: item.barbers?.mainImage || '',
    }));
  }
};
