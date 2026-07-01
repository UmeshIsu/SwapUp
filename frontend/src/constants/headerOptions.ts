import { palette } from '@/src/constants/palette';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

export function useHeaderOptions() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    return {
        headerTitleAlign: 'center' as const,
        headerTitleStyle: { fontSize: 18, fontWeight: '700' as const, color: theme.text },
        headerStyle: { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        headerShadowVisible: false,
        headerTintColor: theme.primary,
        contentStyle: { backgroundColor: isDark ? '#121212' : theme.background },
    };
}
