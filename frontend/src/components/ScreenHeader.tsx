import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/src/constants/palette';

interface Props {
    title: string;
    /** Show the back button (default true). */
    showBack?: boolean;
    /** Custom back handler; defaults to router.back(). */
    onBack?: () => void;
    /** Optional element rendered on the right (e.g. a share/export icon). */
    right?: React.ReactNode;
}

const TITLE_COLOR = '#0F172A';

/**
 * Shared app header — gives every custom screen a pixel-identical top bar:
 * safe-area aware, centered bold title, and a clearly visible blue back button.
 * Matches the navigator header style in constants/headerOptions.ts.
 */
export default function ScreenHeader({ title, showBack = true, onBack, right }: Props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const handleBack = onBack ?? (() => router.back());

    return (
        <View style={[styles.wrap, { paddingTop: insets.top }]}>
            <View style={styles.row}>
                <View style={styles.side}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={styles.iconBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={palette.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                <View style={[styles.side, styles.sideRight]}>{right}</View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: '#FFFFFF',
    },
    row: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    side: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    sideRight: {
        alignItems: 'flex-end',
    },
    iconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: TITLE_COLOR,
    },
});
