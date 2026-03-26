import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/common/hooks/useThemeColors';

export default function TabsLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book-and-go"
        options={{
          title: t('tabs.book_go'),
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t('tabs.appointments'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
