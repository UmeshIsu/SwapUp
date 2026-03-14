import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/src/components/themed-text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

const sections = [
    {
        title: 'Introduction',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Data We collect',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'How We Use Your Data',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Data Sharing',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Data Security',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Your Rights',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
];

export default function PrivacyPolicyScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
        >
            <ThemedText style={styles.pageTitle}>Privacy Policy</ThemedText>

            {sections.map((section, index) => (
                <View key={index} style={styles.section}>
                    <View style={styles.divider} />
                    <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                    <ThemedText style={styles.sectionBody}>{section.body}</ThemedText>
                </View>
            ))}

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 16,
    },
    section: {
        marginBottom: 20,
        alignItems: 'center',
    },
    divider: {
        width: 60,
        height: 1,
        backgroundColor: '#000',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    sectionBody: {
        fontSize: 14,
        lineHeight: 22,
        color: '#555',
        textAlign: 'center',
    },
    bottomSpacer: {
        height: 40,
    },
});
