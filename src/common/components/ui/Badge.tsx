import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Text } from './Text';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const colors = useThemeColors();

  const getColors = () => {
    switch (variant) {
      case 'primary': return { bg: colors.primary, text: colors.primaryText };
      case 'success': return { bg: '#10B981', text: '#FFFFFF' };
      case 'warning': return { bg: '#F59E0B', text: '#FFFFFF' };
      case 'error': return { bg: colors.error, text: '#FFFFFF' };
      case 'default':
      default: return { bg: colors.border, text: colors.text };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text variant="caption" weight="medium" color={text}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
