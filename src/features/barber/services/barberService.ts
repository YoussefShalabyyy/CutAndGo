import { supabase } from '@/lib/supabase';
import { Barber, Service } from '@/common/types';

export const barberService = {
  getBarberById: async (id: string): Promise<Barber> => {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      name: data.name,
      salonName: data.salon_name,
      address: data.address,
      distance: data.distance,
      rating: data.rating,
      reviews: data.reviews,
      mainImage: data.main_image,
      gallery: data.gallery,
    };
  },

  getServicesByBarberId: async (barberId: string): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barber_id', barberId);

    if (error) throw new Error(error.message);
    
    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
    }));
  }
};
