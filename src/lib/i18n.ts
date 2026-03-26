import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';

// Feature translations
import onboardingEn from '../features/onboarding/translations/en';
import onboardingAr from '../features/onboarding/translations/ar';
import homeEn from '../features/home/translations/en';
import homeAr from '../features/home/translations/ar';
import barberEn from '../features/barber/translations/en';
import barberAr from '../features/barber/translations/ar';
import bookingEn from '../features/booking/translations/en';
import bookingAr from '../features/booking/translations/ar';
import appointmentsEn from '../features/appointments/translations/en';
import appointmentsAr from '../features/appointments/translations/ar';
import profileEn from '../features/profile/translations/en';
import profileAr from '../features/profile/translations/ar';

// Common translations
import commonEn from '../common/translations/en';
import commonAr from '../common/translations/ar';

const resources = {
  en: {
    translation: {
      onboarding: onboardingEn,
      home: homeEn,
      barber: barberEn,
      booking: bookingEn,
      appointments: appointmentsEn,
      profile: profileEn,
      tabs: commonEn,
    },
  },
  ar: {
    translation: {
      onboarding: onboardingAr,
      home: homeAr,
      barber: barberAr,
      booking: bookingAr,
      appointments: appointmentsAr,
      profile: profileAr,
      tabs: commonAr,
    },
  },
};

const initI18n = async () => {
  const locales = Localization.getLocales();
  let defaultLang = 'en';

  if (locales && locales.length > 0) {
    const localeTag = locales[0].languageCode;
    if (localeTag === 'ar') defaultLang = 'ar';
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  const isRTL = defaultLang === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

initI18n();

export default i18n;
