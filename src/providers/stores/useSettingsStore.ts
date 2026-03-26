import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n from '../../lib/i18n';

interface SettingsState {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => {
        set({ language: lang });
        if (i18n.isInitialized) {
          i18n.changeLanguage(lang);
          const isRTL = lang === 'ar';
          if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
          }
        }
      },
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'cut-and-go-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
