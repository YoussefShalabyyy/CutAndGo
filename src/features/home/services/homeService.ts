import { supabase } from '@/lib/supabase';
import { Barber } from '@/common/types';

export const homeService = {
  getBarbers: async (): Promise<Barber[]> => {
    const { data, error } = await supabase
      .from('barbers')
      .select('*');

    if (error) {
      console.error('Error fetching barbers:', error);
      throw new Error(error.message);
    }
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      salonName: item.salon_name,
      address: item.address,
      distance: item.distance,
      rating: item.rating,
      reviews: item.reviews,
      mainImage: item.main_image,
      gallery: item.gallery,
    }));
  }
};
