import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    type ViewStyle,
} from 'react-native';

interface AuthButtonProps {
    /** Button label */
    label: string;
    /** Press handler */
    onPress: () => void;
    /** Show a loading spinner instead of the label */
    isLoading?: boolean;
    /** Disable the button (also applied automatically when isLoading) */
    disabled?: boolean;
    /** Optional extra style applied to the outer TouchableOpacity */
    style?: ViewStyle;
}

export default function AuthButton({
    label,
    onPress,
    isLoading = false,
    disabled = false,
    style,
}: AuthButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled, style]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.85}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1373D0',
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        shadowColor: '#1373D0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#93C5FD',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});
