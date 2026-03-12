import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmployeeSchedulePlaceholder() {
    return (
        <View style={styles.container}>
            <Text>Employee Schedule Screen (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
