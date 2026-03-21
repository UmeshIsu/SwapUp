import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

export default function LanguageScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">Select your preferred language</ThemedText>
            </ThemedView>

            <ThemedView style={styles.list}>
                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.langItem,
                            { backgroundColor: theme.background === '#fff' ? '#F9F9F9' : '#252525' },
                            selectedLanguage === lang.code && styles.selectedItem
                        ]}
                        onPress={() => setSelectedLanguage(lang.code)}
                    >
                        <View>
                            <ThemedText style={styles.langName}>{lang.name}</ThemedText>
                            <ThemedText style={styles.nativeName}>{lang.nativeName}</ThemedText>
                        </View>
                        {selectedLanguage === lang.code && (
                            <IconSymbol name="chevron.right" size={24} color={theme.tint} />
                        )}
                    </TouchableOpacity>
                ))}
            </ThemedView>

            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.tint }]}
                onPress={() => router.back()}
            >
                <ThemedText style={styles.saveText}>Save Changes</ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    list: {
        marginBottom: 30,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedItem: {
        borderColor: '#3498db',
    },
    langName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    nativeName: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    saveButton: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
