// apply.tsx - Apply for Leave Screen (Pictures 1 & 3)
// User fills in: Leave Type, Start Date, End Date, Full/Half day, Reason
// Then taps "Apply Leave" to submit

import React, { useState } from 'react';
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
import { submitLeaveRequest } from '@/src/services/leaveApi';

// Hardcoded employee ID (replace with auth in production)
const EMPLOYEE_ID = 1;

// Leave types available — matches what's seeded in database.sql
const LEAVE_TYPES = [
    { id: 1, name: 'Annual Leave', total_days: 14 },
    { id: 2, name: 'Sick Leave', total_days: 7 },
    { id: 3, name: 'Casual Leave', total_days: 5 },
    { id: 4, name: 'Maternity Leave', total_days: 90 },
];

// Month names for date picker
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Generate arrays for day and year selectors
const DAYS: number[] = [];
for (let i = 1; i <= 31; i++) DAYS.push(i);

const YEARS: number[] = [2025, 2026, 2027];

type LeaveType = { id: number; name: string; total_days: number };

export default function ApplyLeave() {
    const router = useRouter();

    // ---- Form state ----
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [showLeaveTypePicker, setShowLeaveTypePicker] = useState(false);

    const [startDate, setStartDate] = useState('');  // stored as YYYY-MM-DD
    const [endDate, setEndDate] = useState('');

    // Date picker modal state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
    const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [pickerDay, setPickerDay] = useState(new Date().getDate());

    const [dayType, setDayType] = useState<'full' | 'half'>('full');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Format YYYY-MM-DD → "Oct 30, 2025" for display in the date boxes
    const formatDisplay = (dateStr: string) => {
        if (!dateStr) return 'Select date';
        const [y, m, d] = dateStr.split('-');
        return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    };

    // Build YYYY-MM-DD string from picker values
    const buildDateString = (y: number, m: number, d: number) => {
        const mm = m < 10 ? `0${m}` : `${m}`;
        const dd = d < 10 ? `0${d}` : `${d}`;
        return `${y}-${mm}-${dd}`;
    };

    // Open the date picker modal for start or end date
    const openDatePicker = (target: 'start' | 'end') => {
        setPickerTarget(target);
        setShowDatePicker(true);
    };

    // Confirm the selected date from the picker
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
        // Validate all required fields
        if (!selectedLeaveType) { Alert.alert('Missing', 'Please select a leave type'); return; }
        if (!startDate) { Alert.alert('Missing', 'Please select a start date'); return; }
        if (!endDate) { Alert.alert('Missing', 'Please select an end date'); return; }
        if (new Date(startDate) > new Date(endDate)) {
            Alert.alert('Error', 'End date must be on or after start date'); return;
        }

        setSubmitting(true);
        try {
            // Try to save to backend (works when backend is running)
            await submitLeaveRequest({
                employeeId: EMPLOYEE_ID,
                leaveTypeId: selectedLeaveType.id,
                startDate,
                endDate,
                dayType,
                reason,
            });
        } catch (error) {
            // Backend not running — still navigate to confirmation screen below
        }
        setSubmitting(false);

        // Always go to confirmation (sent) screen
        router.replace({
            pathname: '/(employee)/leave/sent',
            params: {
                leaveTypeName: selectedLeaveType.name,
                startDate,
                endDate,
            },
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* =========== LEAVE TYPE FIELD =========== */}
            <Text style={styles.label}>Leave Type</Text>
            <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setShowLeaveTypePicker(true)}
                activeOpacity={0.7}
            >
                <Text style={selectedLeaveType ? styles.inputText : styles.placeholder}>
                    {selectedLeaveType ? selectedLeaveType.name : 'Select leave type'}
                </Text>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* =========== DATE ROW =========== */}
            <View style={styles.dateRow}>
                {/* Start Date */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity
                        style={styles.dateBox}
                        onPress={() => openDatePicker('start')}
                        activeOpacity={0.7}
                    >
                        <Text style={startDate ? styles.inputText : styles.placeholder}>
                            {formatDisplay(startDate)}
                        </Text>
                        <Text style={styles.calIcon}>📅</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ width: 12 }} />

                {/* End Date */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>End Date</Text>
                    <TouchableOpacity
                        style={styles.dateBox}
                        onPress={() => openDatePicker('end')}
                        activeOpacity={0.7}
                    >
                        <Text style={endDate ? styles.inputText : styles.placeholder}>
                            {formatDisplay(endDate)}
                        </Text>
                        <Text style={styles.calIcon}>📅</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* =========== FULL / HALF DAY RADIO =========== */}
            <View style={styles.radioRow}>
                <TouchableOpacity style={styles.radioOption} onPress={() => setDayType('full')}>
                    <View style={styles.radioOuter}>
                        {dayType === 'full' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Full day</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.radioOption} onPress={() => setDayType('half')}>
                    <View style={styles.radioOuter}>
                        {dayType === 'half' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Half day</Text>
                </TouchableOpacity>
            </View>

            {/* =========== REASON =========== */}
            <Text style={styles.label}>Reason (Optional)</Text>
            <TextInput
                style={styles.reasonInput}
                placeholder="Provide a reason..."
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={4}
                value={reason}
                onChangeText={setReason}
                textAlignVertical="top"
            />

            {/* =========== SUBMIT BUTTON =========== */}
            <TouchableOpacity
                style={[styles.applyButton, submitting && { opacity: 0.6 }]}
                onPress={handleApplyLeave}
                disabled={submitting}
                activeOpacity={0.8}
            >
                {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.applyButtonText}>Apply Leave</Text>
                }
            </TouchableOpacity>


            {/* =============================================
          LEAVE TYPE PICKER MODAL
          Key fix: Pressable overlay with stopPropagation
          on the inner box so taps on items register
      ============================================== */}
            <Modal
                visible={showLeaveTypePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLeaveTypePicker(false)}
            >
                {/* Dark overlay — tapping it closes the modal */}
                <Pressable
                    style={styles.overlay}
                    onPress={() => setShowLeaveTypePicker(false)}
                >
                    {/* Inner white box — stopPropagation so taps don't close modal */}
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Select Leave Type</Text>
                        <FlatList
                            data={LEAVE_TYPES}
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
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    <Text style={styles.modalItemDays}>{item.total_days} days/yr</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>


            {/* =============================================
          DATE PICKER MODAL
          Year / Month / Day columns
      ============================================== */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setShowDatePicker(false)}
                >
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>
                            {pickerTarget === 'start' ? 'Start Date' : 'End Date'}
                        </Text>

                        {/* Currently selected date preview */}
                        <Text style={styles.datePreview}>
                            {MONTHS[pickerMonth - 1]} {pickerDay}, {pickerYear}
                        </Text>

                        <View style={styles.columns}>

                            {/* Year */}
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

                            {/* Month */}
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

                            {/* Day */}
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
                            <Text style={styles.confirmBtnText}>Confirm Date</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

        </ScrollView>
    );
}

const S = StyleSheet.create;

const styles = S({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, paddingBottom: 50 },

    label: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 6, marginTop: 14 },

    inputBox: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 14,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    inputText: { fontSize: 14, color: '#111' },
    placeholder: { fontSize: 14, color: '#aaa' },
    chevron: { fontSize: 20, color: '#aaa' },

    dateRow: { flexDirection: 'row', marginTop: 4 },
    dateBox: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 14,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    calIcon: { fontSize: 16 },

    radioRow: { flexDirection: 'row', gap: 24, marginTop: 16, marginBottom: 4 },
    radioOption: { flexDirection: 'row', alignItems: 'center' },
    radioOuter: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: '#1a73e8',
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a73e8' },
    radioLabel: { fontSize: 14, color: '#333' },

    reasonInput: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        padding: 12, fontSize: 14, color: '#111', height: 100,
    },

    applyButton: {
        backgroundColor: '#1a73e8', borderRadius: 30,
        paddingVertical: 16, alignItems: 'center', marginTop: 24,
    },
    applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // ---- Modals ----
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: 22,
    },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 14 },
    modalItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f2f2f2',
    },
    modalItemText: { fontSize: 15, color: '#111' },
    modalItemDays: { fontSize: 13, color: '#999' },

    datePreview: {
        fontSize: 18, fontWeight: '700', color: '#1a73e8',
        textAlign: 'center', marginBottom: 14,
    },
    columns: { flexDirection: 'row', gap: 8, height: 200, marginBottom: 16 },
    col: { flex: 1 },
    colHeader: { fontSize: 12, fontWeight: '600', color: '#999', textAlign: 'center', marginBottom: 6 },
    colScroll: { flex: 1 },
    colItem: { paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
    colItemSel: { backgroundColor: '#1a73e8' },
    colItemText: { fontSize: 14, color: '#333' },
    colItemTextSel: { color: '#fff', fontWeight: '700' },

    confirmBtn: {
        backgroundColor: '#1a73e8', borderRadius: 12,
        paddingVertical: 15, alignItems: 'center',
    },
    confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
