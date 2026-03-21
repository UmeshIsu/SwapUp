import React from 'react';
import { TouchableOpacity, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/colors';

interface ButtonProps {
    label: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ label, onPress, style, textStyle, variant = 'primary' }) => {
    const getBackgroundColor = () => {
        switch (variant) {
            case 'secondary': return colors.secondary;
            case 'danger': return colors.danger;
            case 'primary':
            default: return colors.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: getBackgroundColor() }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <ThemedText style={[styles.text, textStyle]}>{label}</ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Button;
