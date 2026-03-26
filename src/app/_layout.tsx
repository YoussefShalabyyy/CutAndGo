import { Stack } from 'expo-router';
import { useSettingsStore } from '@/providers/stores/useSettingsStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import i18next from '@/lib/i18n';

export default function RootLayout() {
  const language = useSettingsStore((state) => state.language);
  const [isI18nReady, setIsI18nReady] = useState(i18next.isInitialized);

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
