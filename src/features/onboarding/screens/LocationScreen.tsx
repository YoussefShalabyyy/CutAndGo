import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/common/components/ui/Button';
import { Text } from '@/common/components/ui/Text';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LocationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const handleNext = () => {
    router.push('/(onboarding)/notifications');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="location" size={80} color={colors.primary} />
        </View>

        <View style={styles.textContent}>
          <Text variant="h2" weight="bold" align="center" style={styles.title}>
            {t('onboarding.location_title')}
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
            {t('onboarding.location_subtitle')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.allow_location')}
          fullWidth
          onPress={handleNext}
          style={styles.button}
        />
        <Button
          title={t('onboarding.skip')}
          variant="ghost"
          fullWidth
          onPress={handleNext}
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
    borderRadius: width * 0.35,
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
  },
});
