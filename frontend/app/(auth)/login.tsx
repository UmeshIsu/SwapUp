import AuthButton from '@/src/components/AuthButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { login, selectedRole } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            await login(email.trim(), password);
            if (selectedRole === 'MANAGER') {
                router.replace('/(manager)/home');
            } else {
                router.replace('/(employee)/home');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >

            <View style={styles.logoContainer}>
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>

            {/* Title */}
            <Text style={styles.title}>Login to your Account</Text>

            {/* Form */}
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#AAAAAA"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#AAAAAA"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />

                <AuthButton
                    label="Sign in"
                    onPress={handleLogin}
                    isLoading={isLoading}
                    style={{ marginTop: 6 }}
                />

            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 24,
        justifyContent: 'flex-start',
    },

    // ── Logo ────────────────────────────────────────────────────────────────
    logoContainer: {
        alignItems: 'center',
        marginTop: 100,
        marginBottom: 48,
    },
    /** Transparent placeholder — same size as the logo in the screenshot.
     *  Remove once you add your real <Image>. */
    logoPlaceholder: {
        width: 110,
        height: 70,
        // Uncomment while testing to visualise the space:
        // borderWidth: 1,
        // borderColor: '#ccc',
        // borderStyle: 'dashed',
    },
    /** Style for the real logo image */
    logoImage: {
        width: 110,
        height: 70,
    },

    // ── Title ───────────────────────────────────────────────────────────────
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 28,
        letterSpacing: 0.1,
    },

    // ── Form ────────────────────────────────────────────────────────────────
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: '#E8E8ED',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 17,
        fontSize: 16,
        marginBottom: 14,
        color: '#1A1A2E',
    },


    // ── Sign Up ─────────────────────────────────────────────────────────────
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 44,
    },
    signUpText: {
        fontSize: 14,
        color: '#888',
    },
    signUpLink: {
        fontSize: 14,
        color: '#2F80ED',
        fontWeight: '700',
    },
});