import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    email: string;
}

export default function CreateAccountStep5({ email }: Props) {
    const inputs = useRef<(TextInput | null)[]>([]);
    const [code, setCode] = React.useState(['', '', '', '']);

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
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
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputs.current[index] = ref; }}
                        style={styles.codeInput}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={index === 0}
                    />
                ))}
            </View>

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
        gap: 12,
        marginBottom: 20,
    },
    codeInput: {
        width: 56,
        height: 56,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '600',
        color: '#1A1A2E',
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
