import { Stack } from 'expo-router';
import { useSettingsStore } from '@/providers/stores/useSettingsStore';
import { QueryProvider } from '@/providers/QueryProvider';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import i18next from '@/lib/i18n';
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';


export default function RootLayout() {
  const language = useSettingsStore((state) => state.language);
  const [isI18nReady, setIsI18nReady] = useState(i18next.isInitialized);
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: '752721057135-b06mr1jksrm7a8n22v39nru1e2o5lqjd.apps.googleusercontent.com', // [iOS] The Google Sans-serif font to use
      webClientId: '752721057135-orkgqmh16v433rrkehr8vrlg80gcp43t.apps.googleusercontent.com', // client ID of type WEB for your server
      profileImageSize: 150
    });
  }, []);

  useEffect(() => {
    if (!i18next.isInitialized) {
      i18next.init().then(() => setIsI18nReady(true));
    } else {
      setIsI18nReady(true);
    }
  }, []);

  useEffect(() => {
    if (isI18nReady && i18next.language !== language) {
      i18next.changeLanguage(language);
    }
  }, [language, isI18nReady]);

  if (!isI18nReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <QueryProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="barber/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </QueryProvider>
  );
}
