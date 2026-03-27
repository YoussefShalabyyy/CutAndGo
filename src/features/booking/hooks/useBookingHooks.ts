import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';

export const useAvailableSlots = (barberId: string, date: string) => {
  return useQuery({
    queryKey: ['availableSlots', barberId, date],
    queryFn: () => bookingService.getAvailableSlots(barberId, date),
    enabled: !!barberId && !!date,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (_, variables) => {
      // Invalidate slots for that day
      queryClient.invalidateQueries({ queryKey: ['availableSlots', variables.barber_id, variables.date] });
      // Invalidate user appointments
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.user_id] });
    },
  });
};
