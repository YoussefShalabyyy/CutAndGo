import i18next from "@/common/i18n/i18n.config";
import { useLanguageStore } from "@/common/i18n/language.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from 'expo-router';
import { useEffect } from "react";

const queryClient = new QueryClient();

export default function Layout() {
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    i18next.changeLanguage(language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
