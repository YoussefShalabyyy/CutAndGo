import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '@/common/types';

interface AppointmentsState {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
}

export const useAppointmentsStore = create<AppointmentsState>()(
  persist(
    (set) => ({
      appointments: [],
      addAppointment: (appointment) =>
        set((state) => ({ appointments: [...state.appointments, appointment] })),
    }),
    {
      name: 'cut-and-go-appointments',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
