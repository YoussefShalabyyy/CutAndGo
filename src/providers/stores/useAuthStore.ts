import { create } from "zustand";

export interface Session {
  access_token: string;
  user: {
    id: string;
    [key: string]: any;
  };
}

interface AuthState {
  hasCompletedOnboarding: boolean;
  session: Session | null;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasCompletedOnboarding: false,
  session: null,
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  resetOnboarding: () => set({ hasCompletedOnboarding: false, session: null }),
  setSession: (session: Session | null) => set({ session }),
}));
