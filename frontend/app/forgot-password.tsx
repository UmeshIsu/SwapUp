import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/src/constants/palette';
import { authAPI } from '@/src/services/api';

type Phase = 'email' | 'reset';

export default function ForgotPasswordScreen() {
    const router = useRouter();

    const [phase, setPhase] = useState<Phase>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const apiError = (e: any, fallback: string) =>
        e?.response?.data?.error || e?.response?.data?.message || e?.message || fallback;

    const sendCode = async () => {
        const clean = email.trim();
        if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            await authAPI.forgotPassword(clean);
            setPhase('reset');
            Alert.alert('Code sent', 'If an account exists for this email, a reset code has been sent. Check your inbox.');
        } catch (e: any) {
            Alert.alert('Error', apiError(e, 'Could not send the reset code.'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!otp.trim()) {
            Alert.alert('Error', 'Enter the code from your email');
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
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            await authAPI.resetPassword(email.trim(), otp.trim(), newPassword);
            Alert.alert('Success', 'Your password has been reset. Please log in.', [
                { text: 'OK', onPress: () => router.replace('/login' as any) },
            ]);
        } catch (e: any) {
            Alert.alert('Error', apiError(e, 'Could not reset the password.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={palette.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forgot Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                    <View style={styles.iconCircle}>
                        <Ionicons name={phase === 'email' ? 'mail-outline' : 'key-outline'} size={30} color={palette.primary} />
                    </View>

                    {phase === 'email' ? (
                        <>
                            <Text style={styles.title}>Reset your password</Text>
                            <Text style={styles.subtitle}>
                                Enter your account email and we'll send you a code to reset your password.
                            </Text>

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@hotel.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]} onPress={sendCode} disabled={isLoading} activeOpacity={0.85}>
                                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send reset code</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>Enter code & new password</Text>
                            <Text style={styles.subtitle}>
                                We sent a code to <Text style={{ fontWeight: '700', color: '#0F172A' }}>{email.trim()}</Text>.
                            </Text>

                            <Text style={styles.label}>Verification code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter the code"
                                placeholderTextColor="#999"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>New password</Text>
                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Create a new password"
                                    placeholderTextColor="#999"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNew}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowNew((s) => !s)} style={styles.eyeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Confirm new password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter the new password"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showNew}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]} onPress={resetPassword} disabled={isLoading} activeOpacity={0.85}>
                                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Reset password</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={sendCode} disabled={isLoading} style={styles.resendBtn}>
                                <Text style={styles.resendText}>Resend code</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { width: 24 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    body: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 18,
    },
    title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748B', lineHeight: 21, marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0F172A',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEF1F5',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEF1F5',
    },
    inputFlex: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#0F172A' },
    eyeBtn: { paddingLeft: 10, paddingVertical: 6 },
    primaryBtn: {
        backgroundColor: palette.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 6,
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    resendBtn: { alignSelf: 'center', marginTop: 16, paddingVertical: 6 },
    resendText: { color: palette.primary, fontSize: 14, fontWeight: '600' },
});
