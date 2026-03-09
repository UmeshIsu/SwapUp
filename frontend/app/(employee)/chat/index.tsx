import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen() {
    return (
        <View style={styles.container}>
            <Text>Chat Screen (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
