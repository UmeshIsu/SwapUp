import React from 'react';
import { StyleSheet, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../src/components/themed-text';
import { ThemedView } from '../../src/components/themed-view';
import { IconSymbol } from '../../src/components/ui/icon-symbol';
import { Colors } from '../../src/constants/theme';
import { useColorScheme } from '../../src/hooks/use-color-scheme';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { user } = useAuth();

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header with Profile Icon in Top Right */}
                <View style={styles.header}>
                    <ThemedText style={styles.welcomeText}>
                        Welcome, {user?.name || 'User'}!
                    </ThemedText>
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={() => router.push('/(employee)/profile')}
                    >
                        <View style={[styles.profileIconContainer, { backgroundColor: theme.tint }]}>
                            <IconSymbol name="person.fill" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <ThemedText style={styles.title}>Home</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Welcome to your main dashboard.
                    </ThemedText>
                    
                    <View style={styles.placeholderCard}>
                        <ThemedText style={styles.cardText}>
                            Use the tabs below to view calendar, chat, leave, and reports.
                        </ThemedText>
                    </View>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
    },
    profileButton: {
        padding: 5,
    },
    profileIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    placeholderCard: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 20,
        borderRadius: 15,
        width: '100%',
    },
    cardText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#555',
    }
});
