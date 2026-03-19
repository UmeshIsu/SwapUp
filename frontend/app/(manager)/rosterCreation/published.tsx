import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PublishedScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Back button */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.push('/home' as any)}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
            </View>

            {/* Success Content */}
            <View style={styles.body}>
                <View style={styles.successCircle}>
                    <Ionicons name="checkmark" size={54} color="#fff" />
                </View>
                <Text style={styles.successTitle}>Roaster Published{'\n'}Successfully</Text>
                <Text style={styles.successSubtitle}>
                    The weekly roaster has been updates for{'\n'}all staff
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topBar: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: -60,
    },
    successCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#22C55E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        shadowColor: '#22C55E',
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 8,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        lineHeight: 34,
        marginBottom: 14,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 21,
    },
});
