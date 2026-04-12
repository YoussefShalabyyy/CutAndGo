import { Redirect } from 'expo-router';
import { useAuthStore } from '@/providers/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { useNotification } from '@/providers/NotificationContext';
import { Text } from '@/common/components/ui/Text';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const [isMounted, setIsMounted] = useState(false);
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const {expoPushToken,devicePushToken,error,notification}= useNotification()
  const colors = useThemeColors()

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if(error) return <Text>Error: {error.message}</Text>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background   }}>
      <Text>Index</Text>
      <Text>Expo Push Token: {expoPushToken}</Text>
      <Text>Device Push Token: {devicePushToken}</Text>
      <Text>Notification: {JSON.stringify(notification)}</Text>
    </SafeAreaView>
  );
  if (!isMounted) return null;

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(onboarding)" />;
  }
}
