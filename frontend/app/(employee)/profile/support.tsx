import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: 'How to change my shift',
        answer: 'Go to My Schedule, tap on the shift you want to change, then select "Request Swap" and choose an available colleague.'
    },
    {
        question: 'Where can view my schedule',
        answer: 'You can view your schedule in the "My Schedule" tab. It shows all your shifts for the current month with a calendar view.'
    },
];

export default function CustomerSupportScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Customer Support</ThemedText>
                <View style={{ width: 24 }} />
            </ThemedView>

            {/* FAQs Section */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Frequently Asked Questions(FAQs)</ThemedText>
                
                {faqs.map((faq, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[styles.faqItem, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}
                        onPress={() => toggleFAQ(index)}
                    >
                        <View style={styles.faqQuestion}>
                            <ThemedText style={styles.faqQuestionText}>{faq.question}</ThemedText>
                            <IconSymbol 
                                name={expandedIndex === index ? "chevron.up" : "chevron.down"} 
                                size={20} 
                                color="#888" 
                            />
                        </View>
                        {expandedIndex === index && (
                            <ThemedText style={styles.faqAnswer}>{faq.answer}</ThemedText>
                        )}
                    </TouchableOpacity>
                ))}
            </ThemedView>

            {/* Contact Support Section */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Contact Support</ThemedText>
                
                <TouchableOpacity style={styles.contactButton}>
                    <View style={styles.contactButtonContent}>
                        <IconSymbol name="envelope.fill" size={20} color="white" />
                        <ThemedText style={styles.contactButtonText}>Send an Email</ThemedText>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactButton}>
                    <View style={styles.contactButtonContent}>
                        <IconSymbol name="bubble.left.fill" size={20} color="white" />
                        <ThemedText style={styles.contactButtonText}>Chat with Us</ThemedText>
                    </View>
                </TouchableOpacity>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    faqItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestionText: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#888',
        marginTop: 12,
        lineHeight: 20,
    },
    contactButton: {
        backgroundColor: '#3498db',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    contactButtonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    contactButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
