import { useQuery } from '@tanstack/react-query';
import { appointmentsService } from '../services/appointmentsService';

export const useAppointments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => appointmentsService.getUserBookings(userId as string),
    enabled: !!userId,
  });
};
