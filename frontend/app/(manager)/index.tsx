import { StyleSheet } from 'react-native';
import { ThemedText } from '../../src/components/themed-text';
import { ThemedView } from '../../src/components/themed-view';

export default function ManagerDashboardScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Manager Dashboard</ThemedText>
            <ThemedText>Welcome to the manager dashboard placeholder.</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
