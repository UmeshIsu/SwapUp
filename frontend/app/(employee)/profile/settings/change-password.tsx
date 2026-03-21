import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { apiCall } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ChangePasswordScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { token } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        if (!/\d/.test(newPassword)) {
            Alert.alert('Error', 'Password must include at least one number');
            return;
        }

        setIsLoading(true);
        try {
            await apiCall('/user/change-password', {
                method: 'PUT',
                token,
                body: { oldPassword: currentPassword, newPassword }
            });
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
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
                <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
                <View style={{ width: 24 }} />
            </ThemedView>

            {/* Current Password */}
            <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Current Password</ThemedText>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}
                        secureTextEntry={!showCurrent}
                        placeholder="••••••••"
                        placeholderTextColor="#888"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowCurrent(!showCurrent)}
                    >
                        <IconSymbol
                            name={showCurrent ? "eye" : "eye.slash"}
                            size={20}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>
            </ThemedView>

            {/* New Password */}
            <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>New Password</ThemedText>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}
                        secureTextEntry={!showNew}
                        placeholder="••••••••"
                        placeholderTextColor="#888"
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowNew(!showNew)}
                    >
                        <IconSymbol
                            name={showNew ? "eye" : "eye.slash"}
                            size={20}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>

                {/* Requirements */}
                <ThemedView style={styles.requirements}>
                    <ThemedText style={styles.requirementTitle}>
                        Must be at least 8 characters and include a number
                    </ThemedText>
                    <CheckItem
                        label="8+ characters"
                        checked={newPassword.length >= 8}
                        error={newPassword.length > 0 && newPassword.length < 8}
                    />
                    <CheckItem
                        label="At least one number"
                        checked={/\d/.test(newPassword)}
                        error={newPassword.length > 0 && !/\d/.test(newPassword)}
                    />
                </ThemedView>
            </ThemedView>

            {/* Confirm Password */}
            <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}
                        secureTextEntry={!showConfirm}
                        placeholder="Confirm your new password"
                        placeholderTextColor="#888"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirm(!showConfirm)}
                    >
                        <IconSymbol
                            name={showConfirm ? "eye" : "eye.slash"}
                            size={20}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>
            </ThemedView>

            {/* Update Button */}
            <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdatePassword}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <ThemedText style={styles.updateButtonText}>Update Password</ThemedText>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

function CheckItem({ label, checked, error }: { label: string; checked: boolean; error?: boolean }) {
    return (
        <View style={styles.checkItem}>
            <View style={[
                styles.checkCircle,
                checked && styles.checkCircleActive,
                error && styles.checkCircleError
            ]}>
                {checked ? (
                    <IconSymbol name="checkmark" size={12} color="white" />
                ) : error ? (
                    <IconSymbol name="xmark" size={12} color="white" />
                ) : null}
            </View>
            <ThemedText style={[
                styles.checkText,
                { color: checked ? '#4CAF50' : (error ? '#FF5A5F' : '#888') }
            ]}>
                {label}
            </ThemedText>
        </View>
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
    inputGroup: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 50,
        fontSize: 15,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 15,
    },
    requirements: {
        marginTop: 12,
    },
    requirementTitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    checkCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#888',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCircleActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkCircleError: {
        backgroundColor: '#FF5A5F',
        borderColor: '#FF5A5F',
    },
    checkText: {
        fontSize: 13,
    },
    updateButton: {
        backgroundColor: '#3498db',
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
