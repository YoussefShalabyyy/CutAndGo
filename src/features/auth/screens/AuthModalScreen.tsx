import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/common/components/ui/Text';
import { useThemeColors } from '@/common/hooks/useThemeColors';
import { socialAuthService } from '../services/socialAuthService';
import { useAuthStore } from '@/providers/stores/useAuthStore';

export default function AuthModalScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSocialMockLogin = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      const newSession = await socialAuthService.mockSocialSignIn(provider);
      if (newSession) {
        setSession(newSession);
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message || `Failed to authenticate with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <Text variant="h2" weight="bold">Log in to Book</Text>
      </View>
      
      <Text variant="body" color={colors.textSecondary} style={styles.modalSub}>
        Please log in quickly using Google or Apple to confirm your appointment.
      </Text>

      {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
      ) : (
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#ECEFF1' }]} 
            onPress={() => handleSocialMockLogin('google')}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text weight="medium" style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#000000' }]} 
            onPress={() => handleSocialMockLogin('apple')}
          >
            <Ionicons name="logo-apple" size={24} color="#fff" />
            <Text weight="medium" color="#fff" style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text variant="caption" color={colors.textSecondary} align="center" style={styles.legalText}>
        By continuing you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalSub: {
    marginBottom: 24,
  },
  socialButtonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  legalText: {
    marginTop: 16,
  },
});
