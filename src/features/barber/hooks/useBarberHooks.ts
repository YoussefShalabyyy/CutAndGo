import { useQuery } from '@tanstack/react-query';
import { barberService } from '../services/barberService';

export const useBarber = (id: string) => {
  return useQuery({
    queryKey: ['barber', id],
    queryFn: () => barberService.getBarberById(id),
    enabled: !!id,
  });
};

export const useServices = (barberId: string) => {
  return useQuery({
    queryKey: ['services', barberId],
    queryFn: () => barberService.getServicesByBarberId(barberId),
    enabled: !!barberId,
  });
};
