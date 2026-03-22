import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/src/components/themed-text';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

interface CustomModalProps {
    visible: boolean;
    title: string;
    icon?: string;
    confirmText: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CustomModal({
    visible,
    title,
    icon,
    confirmText,
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}: CustomModalProps) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.modalCard, { backgroundColor: '#FFFFFF' }]}>
                    {icon && (
                        <View style={styles.iconWrapper}>
                            <View style={styles.iconCircle}>
                                <IconSymbol name={icon as any} size={32} color="white" />
                            </View>
                        </View>
                    )}

                    <ThemedText style={styles.title}>{title}</ThemedText>

                    <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                        <ThemedText style={styles.confirmButtonText}>{confirmText}</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <ThemedText style={styles.cancelButtonText}>{cancelText}</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: width * 0.85,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    iconWrapper: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF5A5F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#000',
    },
    confirmButton: {
        width: '100%',
        backgroundColor: '#FF5A5F',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        width: '100%',
        backgroundColor: '#EAEAEA',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});
