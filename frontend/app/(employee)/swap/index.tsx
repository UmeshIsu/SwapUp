import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SwapScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Swap Requests Feature Coming Soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 16,
        color: '#666',
    },
});
