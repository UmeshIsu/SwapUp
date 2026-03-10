import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManagerHomePlaceholder() {
    return (
        <View style={styles.container}>
            <Text>Manager Home Screen (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});