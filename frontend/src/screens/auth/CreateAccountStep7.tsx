import type { FieldErrors } from '@/app/(auth)/register';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    password: string;
    confirmPassword: string;
    onChangePassword: (value: string) => void;
    onChangeConfirmPassword: (value: string) => void;
    errors?: FieldErrors;
}

export default function CreateAccountStep7({
    password,
    confirmPassword,
    onChangePassword,
    onChangeConfirmPassword,
    errors = {},
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Create a password</Text>
            <Text style={styles.subtitle}>
                Choose a strong password to secure your account.
            </Text>

            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordWrapper, errors.password && styles.passwordWrapperError]}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Create password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={onChangePassword}
                    secureTextEntry={!showPassword}
                    autoFocus
                />
                <TouchableOpacity
                    onPress={() => setShowPassword((s) => !s)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
                </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Text style={[styles.label, { marginTop: errors.password ? 12 : 0 }]}>Confirm Password</Text>
            <View style={[styles.passwordWrapper, errors.confirmPassword && styles.passwordWrapperError]}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={onChangeConfirmPassword}
                    secureTextEntry={!showConfirm}
                />
                <TouchableOpacity
                    onPress={() => setShowConfirm((s) => !s)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
                </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <View style={styles.hints}>
                <Text style={styles.hint}>• Minimum 6 characters</Text>
                <Text style={styles.hint}>• Include letters and numbers</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1A1A2E',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
        marginBottom: 0,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    passwordWrapperError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
        marginBottom: 0,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1A1A2E',
    },
    eyeBtn: {
        paddingLeft: 10,
        paddingVertical: 6,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginBottom: 8,
    },
    hints: {
        marginTop: 4,
    },
    hint: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
});
