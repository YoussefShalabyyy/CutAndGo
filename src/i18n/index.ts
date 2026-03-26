import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar }
};

const initI18n = async () => {
  const locales = Localization.getLocales();
  let defaultLang = 'en';

  if (locales && locales.length > 0) {
    const localeTag = locales[0].languageCode;
    if (localeTag === 'ar') defaultLang = 'ar';
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLang,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
      react: {
        useSuspense: false,
      }
    });

  const isRTL = defaultLang === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

initI18n();

export default i18n;
