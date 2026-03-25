import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./i18n.config";
import { I18nManager } from "react-native";

type Language = "en" | "ar";

type LanguageState = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",

      setLanguage: (lang) => {
        const isRTL = lang === "ar";

        if (I18nManager.isRTL !== isRTL) {
          I18nManager.forceRTL(isRTL);
        }

        i18n.changeLanguage(lang);

        set({ language: lang });
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);