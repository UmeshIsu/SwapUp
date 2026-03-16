import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Easing,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { postCheckIn } from '@/src/api/attendance';
import { useAuth } from '@/src/contexts/AuthContext';

type ScreenState = 'idle' | 'locating' | 'sending' | 'approved' | 'rejected' | 'error';

// ---------------------------------------------------------------------------
// Radar pulse animation component
// ---------------------------------------------------------------------------
function RadarPulse() {
    const rings = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

    useEffect(() => {
        const animations = rings.map((anim, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 400),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 1800,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
                ])
            )
        );
        animations.forEach(a => a.start());
        return () => animations.forEach(a => a.stop());
    }, []);

    return (
        <View style={styles.radarContainer}>
            {rings.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.radarRing,
                        {
                            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
                        },
                    ]}
                />
            ))}
            <View style={styles.radarCenter}>
                <Ionicons name="location" size={32} color="#fff" />
            </View>
        </View>
    );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function CheckInScreen() {
    const router = useRouter();
    const { session } = useAuth();
    const [state, setState] = useState<ScreenState>('idle');
    const [rejectReason, setRejectReason] = useState('');
    const [checkedInAt, setCheckedInAt] = useState('');
    const [distanceM, setDistanceM] = useState(0);

    const handleCheckIn = async () => {
        try {
            // Step 1: request location permission
            setState('locating');
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setRejectReason('Location permission denied. Please enable it in your device settings.');
                setState('rejected');
                return;
            }

            // Step 2: get high-accuracy position
            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude, accuracy } = pos.coords;

            // Step 3: send to backend
            setState('sending');
            const result = await postCheckIn(
                session?.user.id ?? 'anonymous',
                latitude,
                longitude,
                accuracy ?? 999,
                session?.access_token ?? ''
            );

            if (result.status === 'APPROVED') {
                setCheckedInAt(new Date(result.checkedInAt).toLocaleTimeString());
                setDistanceM(result.distanceM);
                setState('approved');
            } else {
                setRejectReason(result.reason);
                setState('rejected');
            }
        } catch (err: any) {
            setRejectReason(err?.message ?? 'Something went wrong. Try again.');
            setState('error');
        }
    };

    // -----------------------------------------------------------------------
    // Render helpers
    // -----------------------------------------------------------------------
    const isLoading = state === 'locating' || state === 'sending';
    const loadingMessage = state === 'locating' ? 'Getting your location…' : 'Verifying with server…';

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <RadarPulse />
                <Text style={styles.loadingText}>{loadingMessage}</Text>
                <ActivityIndicator style={{ marginTop: 20 }} color="#1976D2" />
            </SafeAreaView>
        );
    }

    if (state === 'approved') {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <View style={[styles.resultCircle, { backgroundColor: '#22C55E' }]}>
                    <Ionicons name="checkmark" size={54} color="#fff" />
                </View>
                <Text style={styles.resultTitle}>Check-In Approved!</Text>
                <Text style={styles.resultSub}>Checked in at {checkedInAt}</Text>
                <Text style={styles.resultSub}>{distanceM} m from site</Text>
                <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#22C55E' }]} onPress={() => router.back()}>
                    <Text style={styles.doneTxt}>Done</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (state === 'rejected' || state === 'error') {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <View style={[styles.resultCircle, { backgroundColor: '#EF4444' }]}>
                    <Ionicons name="close" size={54} color="#fff" />
                </View>
                <Text style={styles.resultTitle}>
                    {state === 'rejected' ? 'Check-In Rejected' : 'Something Went Wrong'}
                </Text>
                <Text style={styles.resultSub}>{rejectReason}</Text>
                <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#EF4444' }]} onPress={() => router.back()}>
                    <Text style={styles.doneTxt}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ---- Idle / start state ----
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Check In</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.body}>
                <RadarPulse />
                <Text style={styles.title}>Ready to Check In?</Text>
                <Text style={styles.subtitle}>
                    Your location will be captured and verified against the site. Make sure you are on-site and have good GPS signal.
                </Text>

                <View style={styles.infoCardRow}>
                    <InfoCard icon="locate" label="GPS Required" value="High accuracy" />
                    <InfoCard icon="navigate-circle" label="Max Distance" value="200 m" />
                    <InfoCard icon="time" label="Limit" value="Once/day" />
                </View>

                <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn} activeOpacity={0.85}>
                    <Ionicons name="finger-print" size={22} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.checkInTxt}>Check In Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function InfoCard({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View style={styles.infoCard}>
            <Ionicons name={icon} size={20} color="#1976D2" />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centeredContainer: { flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15,
    },
    backBtn: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    body: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 32 },

    // Radar
    radarContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    radarRing: {
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: '#1976D2',
    },
    radarCenter: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: '#1976D2',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#1976D2', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    },

    // Info cards
    infoCardRow: { flexDirection: 'row', gap: 12, marginBottom: 36 },
    infoCard: {
        flex: 1, backgroundColor: '#EBF3FE', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center', gap: 6,
    },
    infoLabel: { fontSize: 11, color: '#555', fontWeight: '500', textAlign: 'center' },
    infoValue: { fontSize: 12, color: '#1565C0', fontWeight: '700', textAlign: 'center' },

    // Check In button
    checkInBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1976D2', borderRadius: 14,
        paddingVertical: 18, paddingHorizontal: 36,
        shadowColor: '#1976D2', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    checkInTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },

    // Loading
    loadingText: { fontSize: 16, color: '#555', marginTop: 28, fontWeight: '500' },

    // Result screen
    resultCircle: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center', marginBottom: 28,
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
    },
    resultTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 10 },
    resultSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 6 },
    doneBtn: { marginTop: 28, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48 },
    doneTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
