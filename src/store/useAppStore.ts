import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n from '../i18n';

export type Appointment = {
  id: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  image: string;
};

export type Barber = {
  id: string;
  name: string;
  salonName: string;
  distance: number;
  rating: number;
  reviews: number;
  address: string;
  mainImage: string;
  gallery: string[];
};

interface AppState {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  savedBarbers: Barber[];
  toggleSavedBarber: (barber: Barber) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      language: 'en',
      setLanguage: (lang) => {
        set({ language: lang });
        if (i18n.isInitialized) {
          i18n.changeLanguage(lang);
          const isRTL = lang === 'ar';
          if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            // Notice: Needs restart to take effect in React Native
          }
        }
      },
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      appointments: [],
      addAppointment: (appointment) => set((state) => ({ appointments: [...state.appointments, appointment] })),
      savedBarbers: [],
      toggleSavedBarber: (barber) => set((state) => {
        const exists = state.savedBarbers.find((b) => b.id === barber.id);
        if (exists) {
          return { savedBarbers: state.savedBarbers.filter((b) => b.id !== barber.id) };
        }
        return { savedBarbers: [...state.savedBarbers, barber] };
      }),
    }),
    {
      name: 'cut-and-go-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
