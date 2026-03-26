import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Barber } from '@/common/types';

interface FavoritesState {
  savedBarbers: Barber[];
  toggleSavedBarber: (barber: Barber) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      savedBarbers: [],
      toggleSavedBarber: (barber) =>
        set((state) => {
          const exists = state.savedBarbers.find((b) => b.id === barber.id);
          if (exists) {
            return { savedBarbers: state.savedBarbers.filter((b) => b.id !== barber.id) };
          }
          return { savedBarbers: [...state.savedBarbers, barber] };
        }),
    }),
    {
      name: 'cut-and-go-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
