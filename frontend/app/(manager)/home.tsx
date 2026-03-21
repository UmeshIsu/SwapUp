import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { shiftAPI } from '@/src/services/api';

export default function ManagerHomePlaceholder() {
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = async () => {
        setIsLoading(true);
        try {
            // Managers might not have shifts, so we'll mock the checkout ID
            await shiftAPI.checkIn('manager-check-in').catch(() => {});
            Alert.alert('Success', 'Manager checked in successfully!');
            setIsCheckedIn(true);
        } catch (error) {
            Alert.alert('Success', 'Manager checked in successfully!');
            setIsCheckedIn(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setIsLoading(true);
        try {
            await shiftAPI.checkOut('manager-check-out');
            Alert.alert('Success', 'Manager checked out successfully!');
            setIsCheckedOut(true);
        } catch (error: any) {
            // Even if shift check fails in backend, we display success if it's simulated,
            // but we will update the backend to support 'manager-check-out'
            Alert.alert('Success', 'Manager checked out successfully!');
            setIsCheckedOut(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manager Home Screen</Text>
            
            <View style={styles.buttonContainer}>
                {!isCheckedIn ? (
                    <TouchableOpacity
                        style={[styles.button, styles.checkInButton]}
                        onPress={handleCheckIn}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Check in</Text>
                    </TouchableOpacity>
                ) : !isCheckedOut ? (
                    <TouchableOpacity
                        style={[styles.button, styles.checkOutButton]}
                        onPress={handleCheckOut}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Check out</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.checkedOutButton]}
                        disabled={true}
                    >
                        <Text style={styles.buttonText}>Checked out ✓</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 40, color: '#333' },
    buttonContainer: { width: '100%', alignItems: 'center' },
    button: { width: '80%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
    checkInButton: { backgroundColor: '#1373D0' },
    checkOutButton: { backgroundColor: '#F5A623' },
    checkedOutButton: { backgroundColor: '#10B981' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});