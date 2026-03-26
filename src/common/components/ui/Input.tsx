import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" weight="medium" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <Text variant="caption" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
  },
});
