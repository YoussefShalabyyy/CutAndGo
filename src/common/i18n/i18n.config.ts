import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en";
import { ar } from "./translations/ar";

const deviceLanguage = getLocales()[0]?.languageCode === "ar" ? "ar" : "en";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;