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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/src/constants/palette';
import { apiCall } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

export default function ForceChangePasswordScreen() {
    const router = useRouter();
    const { token, user, updateUser, logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const goHome = () => {
        if (user?.role === 'MANAGER') router.replace('/(manager)/home' as any);
        else router.replace('/(employee)/home' as any);
    };

    const handleSubmit = async () => {
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
        if (newPassword === currentPassword) {
            Alert.alert('Error', 'New password must be different from the temporary one');
            return;
        }

        setIsLoading(true);
        try {
            await apiCall('/user/change-password', {
                method: 'PUT',
                token,
                body: { oldPassword: currentPassword, newPassword },
            });
            updateUser({ mustChangePassword: false });
            goHome();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    const Field = ({
        label,
        value,
        onChange,
        show,
        toggle,
        placeholder,
    }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
        show: boolean;
        toggle: () => void;
        placeholder: string;
    }) => (
        <>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrap}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={toggle} style={styles.eyeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.body}>
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-closed" size={30} color={palette.primary} />
                </View>
                <Text style={styles.title}>Set a new password</Text>
                <Text style={styles.subtitle}>
                    For your security, please replace the temporary password your admin gave you
                    with one only you know.
                </Text>

                <Field
                    label="Temporary password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    toggle={() => setShowCurrent((s) => !s)}
                    placeholder="The password from your admin"
                />
                <Field
                    label="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    toggle={() => setShowNew((s) => !s)}
                    placeholder="Create a new password"
                />
                <Field
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    toggle={() => setShowConfirm((s) => !s)}
                    placeholder="Re-enter the new password"
                />

                <View style={styles.hints}>
                    <Text style={styles.hint}>• At least 8 characters</Text>
                    <Text style={styles.hint}>• Include at least one number</Text>
                </View>

                <TouchableOpacity
                    style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    activeOpacity={0.85}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryBtnText}>Save & Continue</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    body: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 24 : 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 18,
    },
    title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748B', lineHeight: 21, marginBottom: 26 },
    label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
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
    input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#0F172A' },
    eyeBtn: { paddingLeft: 10, paddingVertical: 6 },
    hints: { marginTop: 2, marginBottom: 24 },
    hint: { fontSize: 12, color: '#64748B', marginBottom: 2 },
    primaryBtn: {
        backgroundColor: palette.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    logoutBtn: { alignSelf: 'center', marginTop: 18, paddingVertical: 6 },
    logoutText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
});
