import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    email: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function CreateAccountStep5({ email, value, onChange, error }: Props) {
    const inputs = useRef<(TextInput | null)[]>([]);
    
    // Convert string value to array of exactly 8 chars
    const codeArray = value.split('').concat(Array(8).fill('')).slice(0, 8);

    const handleChange = (text: string, index: number) => {
        const newCode = [...codeArray];
        newCode[index] = text;
        onChange(newCode.join(''));

        // Auto-focus next input
        if (text && index < 7) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !codeArray[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Verify your email</Text>
            <Text style={styles.subtitle}>
                We've sent a verification code to{'\n'}
                <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
            </Text>

            <Text style={styles.label}>Verification Code</Text>
            <View style={styles.codeRow}>
                {codeArray.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputs.current[index] = ref; }}
                        style={[styles.codeInput, error && styles.inputError]}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={index === 0}
                    />
                ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <Text style={styles.resendLink}>Resend</Text>
            </Text>
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
    emailHighlight: {
        color: '#2563EB',
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 12,
    },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
        marginBottom: 20,
    },
    codeInput: {
        width: 38,
        height: 48,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A2E',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginBottom: 10,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
    },
    resendLink: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
