import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, noPadding = false }) => {
  const colors = useThemeColors();

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: noPadding ? 0 : 16,
        },
        style,
      ]}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
