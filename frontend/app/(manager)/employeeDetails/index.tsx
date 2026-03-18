import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManagerEmployeesScreen() {
    return (
        <View style={styles.container}>
            <Text>Employees Screen (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
