import { useSettingsStore } from '@/providers/stores/useSettingsStore';

export const Colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#000000',
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

export type ThemeColors = typeof Colors.light;

export const useThemeColors = (): ThemeColors => {
  const theme = useSettingsStore(state => state.theme);
  const isDark = theme === 'dark' || (theme === 'system' && false);
  return isDark ? Colors.dark : Colors.light;
};
