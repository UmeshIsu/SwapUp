import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

export default function PrivacySettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <PrivacyItem label="Data Usage and Sharing" onPress={() => { }} />
            <PrivacyItem label="Manage Data Access" onPress={() => { }} />
            <PrivacyItem label="Terms and Services" onPress={() => { }} />
            <PrivacyItem label="Privacy Policy" onPress={() => { }} />
            <PrivacyItem
                label="Account Deletion"
                onPress={() => {
                    Alert.alert(
                        'Delete Account',
                        'Are you sure you want to delete your account? This action cannot be undone.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Yes, Delete', style: 'destructive', onPress: () => console.log('Account deletion requested') }
                        ]
                    );
                }}
                isDestructive
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
