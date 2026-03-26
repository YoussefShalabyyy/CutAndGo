import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

export const Colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#000000', // Premium black
    primaryText: '#FFFFFF',
    border: '#E5E7EB',
    error: '#EF4444',
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#FFFFFF',
    primaryText: '#000000',
    border: '#374151',
    error: '#F87171',
  }
};

export const useThemeColors = () => {
  const theme = useAppStore(state => state.theme);
  // for MVP simplicity we can just assume light unless explicitly dark, 
  // but let's just use the strict value:
  const isDark = theme === 'dark' || (theme === 'system' && false /* default to light if system not strictly read here */);
  return isDark ? Colors.dark : Colors.light;
};

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  weight?: 'normal' | 'medium' | 'bold';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<CustomTextProps> = ({ 
  variant = 'body', 
  weight = 'normal', 
  color,
  align = 'left',
  style, 
  ...props 
}) => {
  const colors = useThemeColors();

  const getFontSize = () => {
    switch(variant) {
      case 'h1': return 32;
      case 'h2': return 24;
      case 'h3': return 18;
      case 'caption': return 12;
      case 'body':
      default: return 14;
    }
  };

  const getFontWeight = () => {
    switch(weight) {
      case 'bold': return '700';
      case 'medium': return '500';
      case 'normal':
      default: return '400';
    }
  };

  return (
    <RNText
      style={[
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color: color || colors.text,
          textAlign: align,
        },
        style
      ]}
      {...props}
    />
  );
};
