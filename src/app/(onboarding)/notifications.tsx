import React from 'react';
import { View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Text, useThemeColors } from '../../components/ui/Text';
import { useAppStore } from '../../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const completeOnboarding = useAppStore(state => state.completeOnboarding);

  const handleComplete = () => {
    // In a real app we'd request notification permissions here
    completeOnboarding();
    // Use replace so we don't go back to onboarding
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="notifications" size={80} color={colors.primary} />
        </View>
        
        <View style={styles.textContent}>
          <Text variant="h2" weight="bold" align="center" style={styles.title}>
            {t('onboarding.notifications_title')}
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
            {t('onboarding.notifications_subtitle')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title={t('onboarding.enable_notifications')} 
          fullWidth 
          onPress={handleComplete} 
          style={styles.button}
        />
        <Button 
          title={t('onboarding.skip')} 
          variant="ghost" 
          fullWidth 
          onPress={handleComplete} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imagePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  button: {
    marginBottom: 16,
  }
});
