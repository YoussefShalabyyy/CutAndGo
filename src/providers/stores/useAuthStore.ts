import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  hasCompletedOnboarding: boolean;
  session: Session | null;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      session: null,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, session: null }),
      setSession: (session) => set({ session }),
    }),
    {
      name: 'cut-and-go-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
