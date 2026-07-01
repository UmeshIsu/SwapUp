import { palette } from '@/src/constants/palette';
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { postQrCheckIn } from '@/src/services/attendanceService';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

type ScreenState = 'scanning' | 'sending' | 'approved' | 'rejected' | 'error';

export default function QrCheckInScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [state, setState] = useState<ScreenState>('scanning');
    const [message, setMessage] = useState('');
    const [checkedInAt, setCheckedInAt] = useState('');
    const lockRef = useRef(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const styles = makeStyles(theme, isDark);

    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (lockRef.current) return;
        lockRef.current = true;

        try {
            setState('sending');
            const result = await postQrCheckIn(data);

            if (result.status === 'APPROVED') {
                setCheckedInAt(
                    result.checkedInAt
                        ? new Date(result.checkedInAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                          })
                        : ''
                );
                setState('approved');
            } else {
                setMessage(result.reason ?? 'Check-in was rejected.');
                setState('rejected');
            }
        } catch (err: any) {
            setMessage(err?.message ?? 'Something went wrong. Please try again.');
            setState('error');
        }
    };

    const resetAndScan = () => {
        lockRef.current = false;
        setMessage('');
        setState('scanning');
    };

    // ── Permission states ────────────────────────────────────────────────
    if (!permission) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color={theme.primary} />
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.centered}>
                <View style={styles.permIcon}>
                    <Ionicons name="camera-outline" size={40} color={theme.primary} />
                </View>
                <Text style={styles.permTitle}>Camera access needed</Text>
                <Text style={styles.permSub}>
                    SwapUp uses the camera to scan the restaurant QR code for attendance.
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={styles.linkText}>Go back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Result states ────────────────────────────────────────────────────
    if (state === 'approved') {
        return (
            <SafeAreaView style={styles.centered}>
                <View style={[styles.resultCircle, { backgroundColor: '#22C55E' }]}>
                    <Ionicons name="checkmark" size={54} color="#fff" />
                </View>
                <Text style={styles.resultTitle}>Checked In!</Text>
                {!!checkedInAt && <Text style={styles.resultSub}>Checked in at {checkedInAt}</Text>}
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: '#22C55E' }]}
                    onPress={() => router.back()}
                    activeOpacity={0.85}
                >
                    <Text style={styles.primaryBtnText}>Done</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (state === 'rejected' || state === 'error') {
        return (
            <SafeAreaView style={styles.centered}>
                <View style={[styles.resultCircle, { backgroundColor: '#EF4444' }]}>
                    <Ionicons name="close" size={54} color="#fff" />
                </View>
                <Text style={styles.resultTitle}>
                    {state === 'rejected' ? 'Check-In Rejected' : 'Something Went Wrong'}
                </Text>
                <Text style={styles.resultSub}>{message}</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={resetAndScan} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={styles.linkText}>Go back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Camera / scanning state ──────────────────────────────────────────
    return (
        <View style={styles.cameraContainer}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={state === 'scanning' ? handleBarcodeScanned : undefined}
            />

            <SafeAreaView style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Scan to Check In</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.frameWrap}>
                    <View style={styles.frame} />
                    <Text style={styles.hint}>
                        {state === 'sending' ? 'Checking you in…' : 'Point at the restaurant QR code'}
                    </Text>
                    {state === 'sending' && <ActivityIndicator color="#fff" style={{ marginTop: 14 }} />}
                </View>

                <View style={{ height: 60 }} />
            </SafeAreaView>
        </View>
    );
}

const makeStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    centered: {
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    // Permission
    permIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: isDark ? '#1E2D4A' : '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    permTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 8 },
    permSub: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 },

    primaryBtn: {
        backgroundColor: palette.primary,
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 40,
        marginTop: 24,
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    linkText: { color: theme.textSecondary, fontSize: 14, fontWeight: '600' },

    // Camera
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    overlay: { flex: 1, justifyContent: 'space-between' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 20 : 8,
        paddingBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    frameWrap: { alignItems: 'center' },
    frame: {
        width: 240,
        height: 240,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.9)',
        backgroundColor: 'transparent',
    },
    hint: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 24, textAlign: 'center' },

    // Result
    resultCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    resultTitle: { fontSize: 24, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 10 },
    resultSub: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 6 },
});
