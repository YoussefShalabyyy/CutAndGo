import { Redirect } from 'expo-router';
import { useAuthStore } from '@/providers/stores/useAuthStore';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isMounted, setIsMounted] = useState(false);
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(onboarding)" />;
  }
}
