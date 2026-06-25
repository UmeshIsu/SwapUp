import { palette } from '@/src/constants/palette';
// Shared navigator header styling so every stack header looks identical:
// a centered, bold, dark title with a clearly visible blue back button.

export const appHeaderOptions = {
    headerTitleAlign: 'center' as 'center',
    headerTitleStyle: { fontSize: 18, fontWeight: '700' as '700', color: '#0F172A' },
    headerStyle: { backgroundColor: '#FFFFFF' },
    headerShadowVisible: false,
    headerTintColor: palette.primary, // back arrow color — visible on white
    contentStyle: { backgroundColor: '#F8F9FA' },
};
