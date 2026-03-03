import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../themed-text';
import { colors } from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderBarProps {
    title: string;
    showBack?: boolean;
    onBackPress?: () => void;
    rightElement?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
    title,
    showBack = false,
    onBackPress,
    rightElement,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <View style={styles.leftSection}>
                    {showBack && (
                        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.centerSection}>
                    <ThemedText type="subtitle" style={styles.title}>
                        {title}
                    </ThemedText>
                </View>

                <View style={styles.rightSection}>
                    {rightElement}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
    },
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    title: {
        fontWeight: '700',
        color: colors.primary,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
});

export default HeaderBar;
