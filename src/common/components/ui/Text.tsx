import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

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
    switch (variant) {
      case 'h1': return 32;
      case 'h2': return 24;
      case 'h3': return 18;
      case 'caption': return 12;
      case 'body':
      default: return 14;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'bold': return '700' as const;
      case 'medium': return '500' as const;
      case 'normal':
      default: return '400' as const;
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
        style,
      ]}
      {...props}
    />
  );
};
