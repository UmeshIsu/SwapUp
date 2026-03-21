import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    surface: '#F9F9F9',
    card: '#EEF4FB',
    cardAlt: '#FFFBEB',
    headerBg: '#FFFFFF',
    inputBg: '#F9F9F9',
    border: '#F0F0F0',
    borderLight: '#E5E7EB',
    tint: tintColorLight,
    icon: '#687076',
    iconSecondary: '#555',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#1373D0',
    success: '#10B981',
    successBg: '#BFFFC6',
    successLight: '#9BFAA4',
    danger: '#EF4444',
    warning: '#F5A623',
    warningBg: '#FFFBEB',
    hamburger: '#333',
    shadow: 'rgba(0,0,0,0.05)',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textMuted: '#6B7280',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#1A2332',
    cardAlt: '#2A2520',
    headerBg: '#1A1A1A',
    inputBg: '#2C2C2C',
    border: '#2C2C2C',
    borderLight: '#3A3A3A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    iconSecondary: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#4A9EE5',
    success: '#34D399',
    successBg: '#1A3A2A',
    successLight: '#1A4A2A',
    danger: '#F87171',
    warning: '#FBBF24',
    warningBg: '#2A2520',
    hamburger: '#ECEDEE',
    shadow: 'rgba(0,0,0,0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
