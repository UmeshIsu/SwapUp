import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { CustomModal } from '@/src/components/ui/CustomModal';

export default function PrivacySettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <PrivacyItem label="Data Usage and Sharing" onPress={() => { }} />
            <PrivacyItem label="Manage Data Access" onPress={() => { }} />
            <PrivacyItem label="Terms and Services" onPress={() => { }} />
            <PrivacyItem label="Privacy Policy" onPress={() => { }} />
            <PrivacyItem
                label="Account Deletion"
                onPress={() => setIsDeleteModalVisible(true)}
                isDestructive
            />

            <CustomModal
                visible={isDeleteModalVisible}
                title="Are you sure to delete your Account ?"
                icon="trash.fill"
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onConfirm={() => {
                    console.log('Account deletion requested');
                    setIsDeleteModalVisible(false);
                }}
                onCancel={() => setIsDeleteModalVisible(false)}
            />
        </ScrollView>
    );
}

function PrivacyItem({ label, onPress, isDestructive }: { label: string; onPress: () => void; isDestructive?: boolean }) {
    const theme = Colors[useColorScheme() ?? 'light'];
    return (
        <TouchableOpacity style={[styles.item, { backgroundColor: 'rgba(0,0,0,0.02)' }]} onPress={onPress}>
            <ThemedText style={[styles.label, isDestructive && styles.destructiveText]}>{label}</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDestructive ? '#FF5A5F' : theme.icon} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    destructiveText: {
        color: '#FF5A5F',
    },
});
