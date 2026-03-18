import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LeaveScreen() {
    return (
        <View style={styles.container}>
            <Text>Leave Screen (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
