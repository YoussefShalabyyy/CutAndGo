import { useQuery } from '@tanstack/react-query';
import { homeService } from '../services/homeService';

export const useBarbers = () => {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: homeService.getBarbers,
  });
};
