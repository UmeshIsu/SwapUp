import { palette } from '@/src/constants/palette';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    FlatList,
    Alert,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { submitLeaveRequest, getLeaveTypes, LeaveType } from '@/src/services/leaveApi';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAYS: number[] = [];
for (let i = 1; i <= 31; i++) DAYS.push(i);

const YEARS: number[] = [2025, 2026, 2027];

export default function ApplyLeave() {
    const router = useRouter();
    const { user } = useAuth();
    const EMPLOYEE_ID = user?.id || '';
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const C = {
        bg: theme.background,
        card: theme.surface,
        text: theme.text,
        textSecondary: theme.textSecondary,
        textMuted: theme.textMuted,
        primary: theme.primary,
        primarySoft: isDark ? '#1E2D4A' : '#EFF6FF',
        border: theme.border,
        divider: theme.borderLight,
        danger: theme.danger,
    };

    const styles = makeStyles(C);

    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const types = await getLeaveTypes();
                if (types && types.length > 0) {
                    setLeaveTypes(types);
                }
            } catch (error) {
                console.error('Failed to load leave types:', error);
                setFetchError(true);
            } finally {
                setLoadingTypes(false);
            }
        };
        fetchLeaveTypes();
    }, []);

    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [showLeaveTypePicker, setShowLeaveTypePicker] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
    const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
    const [pickerDay, setPickerDay] = useState(new Date().getDate());

    const [dayType, setDayType] = useState<'full' | 'half'>('full');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const formatDisplay = (dateStr: string) => {
        if (!dateStr) return 'Select date';
        const [y, m, d] = dateStr.split('-');
        return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    };

    const buildDateString = (y: number, m: number, d: number) => {
        const mm = m < 10 ? `0${m}` : `${m}`;
        const dd = d < 10 ? `0${d}` : `${d}`;
        return `${y}-${mm}-${dd}`;
    };

    const openDatePicker = (target: 'start' | 'end') => {
        setPickerTarget(target);
        setShowDatePicker(true);
    };

    const confirmDate = () => {
        const dateStr = buildDateString(pickerYear, pickerMonth, pickerDay);
        if (pickerTarget === 'start') {
            setStartDate(dateStr);
        } else {
            setEndDate(dateStr);
        }
        setShowDatePicker(false);
    };

    const handleApplyLeave = async () => {
        if (!EMPLOYEE_ID) { Alert.alert('Error', 'You must be logged in to apply for leave'); return; }
        if (!selectedLeaveType) { Alert.alert('Missing', 'Please select a leave type'); return; }
        if (!startDate) { Alert.alert('Missing', 'Please select a start date'); return; }
        if (!endDate) { Alert.alert('Missing', 'Please select an end date'); return; }
        if (new Date(startDate) > new Date(endDate)) {
            Alert.alert('Error', 'End date must be on or after start date'); return;
        }

        setSubmitting(true);
        try {
            await submitLeaveRequest({
                employeeId: EMPLOYEE_ID,
                leaveTypeId: selectedLeaveType.id,
                startDate,
                endDate,
                dayType,
                reason,
            });

            setSubmitting(false);

            router.replace({
                pathname: '/(employee)/leave/sent',
                params: {
                    leaveTypeName: selectedLeaveType.name,
                    startDate,
                    endDate,
                },
            });
        } catch (error: any) {
            setSubmitting(false);
            Alert.alert('Error', error?.message || 'Could not submit your leave request. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* ---- Leave Type ---- */}
            <Text style={styles.sectionLabel}>Leave Type</Text>
            <TouchableOpacity
                style={styles.card}
                onPress={() => setShowLeaveTypePicker(true)}
                activeOpacity={0.7}
            >
                <View style={styles.cardRow}>
                    <View style={[styles.fieldIcon, { backgroundColor: C.primarySoft }]}>
                        <Ionicons name="layers-outline" size={18} color={C.primary} />
                    </View>
                    <Text style={selectedLeaveType ? styles.fieldValue : styles.fieldPlaceholder}>
                        {selectedLeaveType ? selectedLeaveType.name : 'Select leave type'}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                </View>
            </TouchableOpacity>

            {/* ---- Date Row ---- */}
            <Text style={styles.sectionLabel}>Duration</Text>
            <View style={styles.card}>
                <TouchableOpacity
                    style={[styles.cardRow, styles.cardRowBorder]}
                    onPress={() => openDatePicker('start')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.fieldIcon, { backgroundColor: '#ECFDF5' }]}>
                        <Ionicons name="calendar-outline" size={18} color="#15803D" />
                    </View>
                    <View style={styles.fieldTextGroup}>
                        <Text style={styles.fieldMeta}>Start Date</Text>
                        <Text style={startDate ? styles.fieldValue : styles.fieldPlaceholder}>
                            {formatDisplay(startDate)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cardRow}
                    onPress={() => openDatePicker('end')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.fieldIcon, { backgroundColor: '#FEF2F2' }]}>
                        <Ionicons name="calendar-outline" size={18} color={C.danger} />
                    </View>
                    <View style={styles.fieldTextGroup}>
                        <Text style={styles.fieldMeta}>End Date</Text>
                        <Text style={endDate ? styles.fieldValue : styles.fieldPlaceholder}>
                            {formatDisplay(endDate)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                </TouchableOpacity>
            </View>

            {/* ---- Day Type ---- */}
            <Text style={styles.sectionLabel}>Day Type</Text>
            <View style={[styles.card, styles.radioCard]}>
                {(['full', 'half'] as const).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.radioOption, dayType === type && styles.radioOptionActive]}
                        onPress={() => setDayType(type)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.radioCircle, dayType === type && styles.radioCircleActive]}>
                            {dayType === type && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.radioLabel, dayType === type && styles.radioLabelActive]}>
                            {type === 'full' ? 'Full Day' : 'Half Day'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ---- Reason ---- */}
            <Text style={styles.sectionLabel}>Reason <Text style={styles.optionalTag}>(Optional)</Text></Text>
            <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
                <TextInput
                    style={styles.reasonInput}
                    placeholder="Provide a reason for your leave..."
                    placeholderTextColor={C.textMuted}
                    multiline
                    numberOfLines={4}
                    value={reason}
                    onChangeText={setReason}
                    textAlignVertical="top"
                />
            </View>

            {/* ---- Submit ---- */}
            <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={handleApplyLeave}
                disabled={submitting}
                activeOpacity={0.8}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>Apply Leave</Text>
                    </>
                )}
            </TouchableOpacity>


            {/* ===================== LEAVE TYPE MODAL ===================== */}
            <Modal
                visible={showLeaveTypePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLeaveTypePicker(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setShowLeaveTypePicker(false)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Select Leave Type</Text>

                        {loadingTypes ? (
                            <ActivityIndicator color={C.primary} style={{ marginVertical: 24 }} />
                        ) : fetchError || leaveTypes.length === 0 ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="cloud-offline-outline" size={32} color={C.textMuted} />
                                <Text style={styles.errorText}>Could not connect to the backend server.</Text>
                                <Text style={styles.errorSub}>
                                    Verify your local network and EXPO_PUBLIC_API_URL in your .env file.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={leaveTypes}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setSelectedLeaveType(item);
                                            setShowLeaveTypePicker(false);
                                        }}
                                        activeOpacity={0.6}
                                    >
                                        <View style={styles.modalItemLeft}>
                                            <View style={styles.modalItemDot} />
                                            <Text style={styles.modalItemText}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.modalItemDays}>{item.totalDays} days/yr</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </Pressable>
                </Pressable>
            </Modal>


            {/* ===================== DATE PICKER MODAL ===================== */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setShowDatePicker(false)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>
                            {pickerTarget === 'start' ? 'Start Date' : 'End Date'}
                        </Text>

                        <Text style={styles.datePreview}>
                            {MONTHS[pickerMonth - 1]} {pickerDay}, {pickerYear}
                        </Text>

                        <View style={styles.columns}>
                            <View style={styles.col}>
                                <Text style={styles.colHeader}>Year</Text>
                                <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                                    {YEARS.map((y) => (
                                        <TouchableOpacity
                                            key={y}
                                            style={[styles.colItem, pickerYear === y && styles.colItemSel]}
                                            onPress={() => setPickerYear(y)}
                                        >
                                            <Text style={[styles.colItemText, pickerYear === y && styles.colItemTextSel]}>
                                                {y}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.colHeader}>Month</Text>
                                <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                                    {MONTHS.map((m, idx) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.colItem, pickerMonth === idx + 1 && styles.colItemSel]}
                                            onPress={() => setPickerMonth(idx + 1)}
                                        >
                                            <Text style={[styles.colItemText, pickerMonth === idx + 1 && styles.colItemTextSel]}>
                                                {m}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.colHeader}>Day</Text>
                                <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                                    {DAYS.map((d) => (
                                        <TouchableOpacity
                                            key={d}
                                            style={[styles.colItem, pickerDay === d && styles.colItemSel]}
                                            onPress={() => setPickerDay(d)}
                                        >
                                            <Text style={[styles.colItemText, pickerDay === d && styles.colItemTextSel]}>
                                                {d}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.confirmBtn} onPress={confirmDate}>
                            <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.confirmBtnText}>Confirm Date</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

        </ScrollView>
    );
}

const makeStyles = (C: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },

    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: C.textSecondary,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 4,
    },
    optionalTag: {
        fontSize: 12,
        fontWeight: '500',
        color: C.textMuted,
        textTransform: 'none',
        letterSpacing: 0,
    },

    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 18,
        overflow: 'hidden',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    cardRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
    },
    fieldIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fieldTextGroup: {
        flex: 1,
    },
    fieldMeta: {
        fontSize: 11,
        fontWeight: '600',
        color: C.textMuted,
        letterSpacing: 0.3,
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '600',
        color: C.text,
    },
    fieldPlaceholder: {
        fontSize: 14,
        fontWeight: '500',
        color: C.textMuted,
        flex: 1,
    },

    radioCard: {
        flexDirection: 'row',
        padding: 6,
        gap: 8,
    },
    radioOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    radioOptionActive: {
        backgroundColor: C.primarySoft,
        borderColor: C.primary,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleActive: {
        borderColor: C.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: C.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: C.textSecondary,
        fontWeight: '500',
    },
    radioLabelActive: {
        color: C.primary,
        fontWeight: '700',
    },

    reasonInput: {
        padding: 16,
        fontSize: 14,
        color: C.text,
        height: 110,
        fontWeight: '500',
    },

    submitButton: {
        backgroundColor: C.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: C.primary,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // ---- Modals ----
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: C.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 16,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: C.border,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: C.text,
        marginBottom: 16,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
    },
    modalItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalItemDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.primary,
        opacity: 0.5,
    },
    modalItemText: {
        fontSize: 15,
        color: C.text,
        fontWeight: '500',
    },
    modalItemDays: {
        fontSize: 13,
        color: C.textMuted,
        fontWeight: '500',
    },

    errorBox: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    errorText: {
        color: C.danger,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    errorSub: {
        color: C.textMuted,
        textAlign: 'center',
        fontSize: 12,
    },

    datePreview: {
        fontSize: 20,
        fontWeight: '800',
        color: C.primary,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    columns: {
        flexDirection: 'row',
        gap: 8,
        height: 200,
        marginBottom: 16,
    },
    col: { flex: 1 },
    colHeader: {
        fontSize: 11,
        fontWeight: '700',
        color: C.textMuted,
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    colScroll: { flex: 1 },
    colItem: {
        paddingVertical: 9,
        borderRadius: 10,
        alignItems: 'center',
    },
    colItemSel: {
        backgroundColor: C.primary,
    },
    colItemText: {
        fontSize: 14,
        color: C.textSecondary,
        fontWeight: '500',
    },
    colItemTextSel: {
        color: '#fff',
        fontWeight: '700',
    },

    confirmBtn: {
        backgroundColor: C.primary,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: C.primary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
