import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/common/components/ui/Text';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { useSettingsStore } from '@/providers/stores/useSettingsStore';
import { useAuthStore } from '@/providers/stores/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();

  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const resetOnboarding = useAuthStore((state) => state.resetOnboarding);

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    console.log('Language changed, please restart app for RTL layout changes to fully apply.');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    resetOnboarding();
    router.replace('/(onboarding)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text variant="h1" color="#FFF">A</Text>
          </View>
          <Text variant="h2" weight="bold">Ahmed User</Text>
          <Text variant="body" color={colors.textSecondary}>+20 123 456 7890</Text>
        </View>

        <View style={styles.section}>
          <Text variant="caption" weight="bold" color={colors.textSecondary} style={styles.sectionTitle}>
            SETTINGS
          </Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={handleLanguageToggle}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="language" size={24} color={colors.text} />
              <Text weight="medium" style={styles.menuItemText}>{t('profile.language')}</Text>
            </View>
            <Text color={colors.textSecondary}>{language === 'en' ? t('profile.english') : t('profile.arabic')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={handleThemeToggle}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon" size={24} color={colors.text} />
              <Text weight="medium" style={styles.menuItemText}>{t('profile.dark_mode')}</Text>
            </View>
            <Text color={colors.textSecondary}>{theme}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out" size={24} color={colors.error} />
              <Text weight="medium" color={colors.error} style={styles.menuItemText}>{t('profile.logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
  },
});
