import AuthButton from '@/src/components/AuthButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CreateAccountStep1 from '@/src/screens/auth/CreateAccountStep1';
import CreateAccountStep2 from '@/src/screens/auth/CreateAccountStep2';
import CreateAccountStep3 from '@/src/screens/auth/CreateAccountStep3';
import CreateAccountStep4 from '@/src/screens/auth/CreateAccountStep4';
import CreateAccountStep5 from '@/src/screens/auth/CreateAccountStep5';
import CreateAccountStep6 from '@/src/screens/auth/CreateAccountStep6';
import CreateAccountStep7 from '@/src/screens/auth/CreateAccountStep7';
import CreateAccountStep_Department from '@/src/screens/auth/CreateAccountStep_Department';

export interface FieldErrors {
    [key: string]: string;
}

// ── Step definitions per role ───────────────────────────────────────────
type StepName =
    | 'hotelName'
    | 'department'
    | 'name'
    | 'phone'
    | 'email'
    | 'verification'
    | 'workerId'
    | 'password';

const MANAGER_STEPS: StepName[] = [
    'hotelName',
    'department',
    'name',
    'phone',
    'email',
    'verification',
    'workerId',
    'password',
];

const EMPLOYEE_STEPS: StepName[] = [
    'hotelName',
    'department',
    'name',
    'phone',
    'email',
    'verification',
    'workerId',
    'password',
];

export default function RegisterScreen() {
    const router = useRouter();
    const { register, selectedRole } = useAuth();

    // Pick steps based on role
    const steps = selectedRole === 'MANAGER' ? MANAGER_STEPS : EMPLOYEE_STEPS;
    const TOTAL_STEPS = steps.length;

    const [currentStep, setCurrentStep] = useState(0); // 0-indexed
    const [formData, setFormData] = useState({
        hotelName: '',
        department: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        workerId: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});

    const currentStepName = steps[currentStep];

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    // ── Validation per step name ────────────────────────────────────
    const validateStep = (): boolean => {
        const newErrors: FieldErrors = {};

        switch (currentStepName) {
            case 'hotelName':
                if (!formData.hotelName.trim()) {
                    newErrors.hotelName = 'Hotel name is required';
                }
                break;
            case 'department':
                if (!formData.department.trim()) {
                    newErrors.department = 'Please select a department';
                }
                break;
            case 'name':
                if (!formData.firstName.trim()) {
                    newErrors.firstName = 'First name is required';
                }
                if (!formData.lastName.trim()) {
                    newErrors.lastName = 'Last name is required';
                }
                break;
            case 'phone': {
                const phoneDigits = formData.phone.replace(/\D/g, '');
                if (!phoneDigits) {
                    newErrors.phone = 'Phone number is required';
                } else if (phoneDigits.length < 9) {
                    newErrors.phone = 'Invalid Number';
                }
                break;
            }
            case 'email': {
                const email = formData.email.trim();
                if (!email) {
                    newErrors.email = 'Email is required';
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        newErrors.email = 'Invalid email address';
                    }
                }
                break;
            }
            case 'verification':
                // Email verification — currently auto-proceeds
                break;
            case 'workerId':
                if (!formData.workerId.trim()) {
                    newErrors.workerId = 'Worker ID is required';
                }
                break;
            case 'password':
                if (!formData.password.trim()) {
                    newErrors.password = 'Password is required';
                } else if (formData.password.length < 6) {
                    newErrors.password = 'Must be at least 6 characters';
                }
                if (!formData.confirmPassword.trim()) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Register logic ──────────────────────────────────────────────
    const handleRegister = async () => {
        const { hotelName, department, firstName, lastName, phone, email, workerId, password } = formData;

        setIsLoading(true);
        try {
            await register({
                email: email.trim(),
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim() || undefined,
                workerId: workerId.trim() || undefined,
                hotelName: hotelName.trim() || undefined,
                department: department.trim() || undefined,
            });

            if (selectedRole === 'MANAGER') {
                router.replace('/(manager)/home');
            } else {
                router.replace('/(employee)/home');
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Next / Submit handler ────────────────────────────────────────
    const handleNext = () => {
        if (!validateStep()) return;

        if (currentStep < TOTAL_STEPS - 1) {
            setErrors({});
            setCurrentStep(prev => prev + 1);
        } else {
            handleRegister();
        }
    };

    const handleBack = () => {
        setErrors({});
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    // ── Button label per step ────────────────────────────────────────
    const getButtonLabel = (): string => {
        if (currentStepName === 'verification') return 'Verify';
        if (currentStepName === 'workerId') return 'Verify';
        if (currentStepName === 'password') return 'Create Account';
        return 'Next';
    };

    // ── Render current step content ──────────────────────────────────
    const renderStep = () => {
        switch (currentStepName) {
            case 'hotelName':
                return (
                    <CreateAccountStep1
                        value={formData.hotelName}
                        onChange={(v) => updateField('hotelName', v)}
                        error={errors.hotelName}
                    />
                );
            case 'department':
                return (
                    <CreateAccountStep_Department
                        value={formData.department}
                        onChange={(v) => updateField('department', v)}
                        error={errors.department}
                    />
                );
            case 'name':
                return (
                    <CreateAccountStep2
                        firstName={formData.firstName}
                        lastName={formData.lastName}
                        onChangeFirstName={(v) => updateField('firstName', v)}
                        onChangeLastName={(v) => updateField('lastName', v)}
                        errors={errors}
                    />
                );
            case 'phone':
                return (
                    <CreateAccountStep3
                        value={formData.phone}
                        onChange={(v) => updateField('phone', v)}
                        error={errors.phone}
                    />
                );
            case 'email':
                return (
                    <CreateAccountStep4
                        value={formData.email}
                        onChange={(v) => updateField('email', v)}
                        error={errors.email}
                    />
                );
            case 'verification':
                return (
                    <CreateAccountStep5
                        email={formData.email}
                    />
                );
            case 'workerId':
                return (
                    <CreateAccountStep6
                        value={formData.workerId}
                        onChange={(v) => updateField('workerId', v)}
                        error={errors.workerId}
                    />
                );
            case 'password':
                return (
                    <CreateAccountStep7
                        password={formData.password}
                        confirmPassword={formData.confirmPassword}
                        onChangePassword={(v) => updateField('password', v)}
                        onChangeConfirmPassword={(v) => updateField('confirmPassword', v)}
                        errors={errors}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* ── Progress ── */}
                <View style={styles.progressSection}>
                    <Text style={styles.stepText}>Step {currentStep + 1} of {TOTAL_STEPS}</Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* ── Step Content ── */}
                <View style={styles.content}>
                    {renderStep()}
                </View>

                {/* ── Bottom ── */}
                <View style={styles.bottom}>
                    <AuthButton
                        label={getButtonLabel()}
                        onPress={handleNext}
                        isLoading={isLoading}
                        style={{ marginBottom: 16 }}
                    />

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>If you have an Account? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },

    /* ── Header ── */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#F2F2F7',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        fontSize: 26,
        color: '#000000',
        lineHeight: 30,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
        flex: 1,
    },

    /* ── Progress ── */
    progressSection: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    stepText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '500',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#D1D5DB',
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1373D0',
        borderRadius: 99,
    },

    /* ── Content ── */
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    /* ── Bottom ── */
    bottom: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 12 : 24,
        paddingTop: 12,
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    loginText: {
        fontSize: 13,
        color: '#6B7280',
    },
    loginLink: {
        fontSize: 13,
        color: '#1373D0',
        fontWeight: '700',
    },
});