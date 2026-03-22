import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

interface ShareSheetProps {
    sheetRef: React.Ref<BottomSheet>;
    onExport: () => void;
}

export default function ShareSheet({ sheetRef, onExport }: ShareSheetProps) {
    return (
        <BottomSheet
            ref={sheetRef}
            snapPoints={['30%']}
            index={-1}
            enablePanDownToClose={true}
            backgroundStyle={styles.sheetBackground}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={styles.sheetTitle}>Share Schedule</Text>
                <Text style={styles.sheetMessage}>Export your schedule to Google Calendar or other apps.</Text>
                
                <TouchableOpacity style={styles.exportButton} onPress={onExport}>
                    <Text style={styles.exportButtonText}>Export to Calendar</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    sheetBackground: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1F2937',
    },
    sheetMessage: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    exportButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
