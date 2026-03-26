import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
    }),
    {
      name: 'cut-and-go-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
