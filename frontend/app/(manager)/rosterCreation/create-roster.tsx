import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { authAPI, shiftAPI } from '../../../src/services/api';
import { useEffect } from 'react';

// Day names (fixed order Mon–Sun)
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ShiftEmployee = {
    id: string;
    name: string;
    color: string;
};

type ShiftRow = {
    id: string;
    startTime: string;
    endTime: string;
    employees: ShiftEmployee[];
    task: string;
};

const EMPLOYEE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

let rowIdCounter = 10;
let empIdCounter = 100;

function generateId() {
    return String(rowIdCounter++);
}
function generateEmpId() {
    return String(empIdCounter++);
}

// Initial empty state for newly created rosters
const EMPTY_DAY_ROWS: ShiftRow[] = [];

export default function CreateRosterScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ weekLabel?: string; weekStartISO?: string }>();

    // Derive the 7 day-date pairs from the passed Monday ISO string
    const weekDates: { name: string; date: string; fullDate: Date }[] = (() => {
        const monday = params.weekStartISO ? new Date(params.weekStartISO) : (() => {
            const now = new Date();
            const dow = now.getDay();
            const mon = new Date(now);
            mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
            mon.setHours(0, 0, 0, 0);
            return mon;
        })();
        return DAY_NAMES.map((name, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return { name, date: String(d.getDate()), fullDate: d };
        });
    })();

    // Default selected day: today if this week's dates include today, else Monday
    const todayDate = new Date();
    const defaultDayIdx = (() => {
        const idx = weekDates.findIndex(d =>
            d.fullDate.getFullYear() === todayDate.getFullYear() &&
            d.fullDate.getMonth() === todayDate.getMonth() &&
            d.fullDate.getDate() === todayDate.getDate()
        );
        return idx >= 0 ? idx : 0;
    })();

    const [selectedDayIdx, setSelectedDayIdx] = useState(defaultDayIdx);
    // Store the full week's schedule
    const [weekSchedule, setWeekSchedule] = useState<Record<number, ShiftRow[]>>(() => {
        return [0, 1, 2, 3, 4, 5, 6].reduce((acc, i) => ({ ...acc, [i]: [] }), {});
    });

    // Current rows being edited for the selected day
    const [rows, setRows] = useState<ShiftRow[]>([]);

    // Sync rows with weekSchedule when selectedDayIdx changes
    useEffect(() => {
        // First, if there are existing rows, they're handled by the onPress setter 
        // to avoid race conditions or lost state.
    }, [selectedDayIdx]);

    const handleDayChange = (newIdx: number) => {
        // Save current rows to the previous day index
        setWeekSchedule(prev => ({ ...prev, [selectedDayIdx]: rows }));
        // Switch to new day
        setSelectedDayIdx(newIdx);
        // Load rows for the new day
        setRows(weekSchedule[newIdx] || []);
    };

    // Edit time modal state
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');

    // Edit name modal state
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [editingRowForName, setEditingRowForName] = useState<string | null>(null);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState('');

    // Add employee name modal
    const [addEmpModalVisible, setAddEmpModalVisible] = useState(false);
    const [addEmpRowId, setAddEmpRowId] = useState<string | null>(null);
    const [addEmpName, setAddEmpName] = useState('');

    const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await authAPI.getAllEmployees();
                setAvailableEmployees(response.data);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
                Alert.alert("Error", "Failed to load employees for this hotel.");
            }
        };
        fetchEmployees();
    }, []);

    const weekRangeLabel = params.weekLabel ?? weekDates[0].name + ' ' + weekDates[0].date + ' – ' + weekDates[6].name + ' ' + weekDates[6].date;

    // --- Row actions ---
    const addRow = () => {
        const newId = generateId();
        setRows((prev: ShiftRow[]) => [
            ...prev,
            { id: newId, startTime: '08:00 AM', endTime: '09:00 AM', employees: [], task: '' },
        ]);
    };

    const deleteRow = (rowId: string) => {
        Alert.alert('Remove Shift', 'Remove this shift row?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => setRows((prev: ShiftRow[]) => prev.filter((r: ShiftRow) => r.id !== rowId)) },
        ]);
    };

    // --- Employee actions ---
    const openAddEmployee = (rowId: string) => {
        setAddEmpRowId(rowId);
        setAddEmpName('');
        setAddEmpModalVisible(true);
    };

    const confirmAddEmployee = (emp: any) => {
        if (!addEmpRowId) return;
        const newEmp: ShiftEmployee = {
            id: emp.id,
            name: emp.name,
            color: EMPLOYEE_COLORS[Math.floor(Math.random() * EMPLOYEE_COLORS.length)],
        };
        setRows((prev: ShiftRow[]) =>
            prev.map((r: ShiftRow) => r.id === addEmpRowId ? { ...r, employees: [...r.employees, newEmp] } : r)
        );
        setAddEmpModalVisible(false);
    };

    const removeEmployee = (rowId: string, empId: string) => {
        setRows((prev: ShiftRow[]) =>
            prev.map((r: ShiftRow) =>
                r.id === rowId ? { ...r, employees: r.employees.filter((e: ShiftEmployee) => e.id !== empId) } : r
            )
        );
    };

    const openEditName = (rowId: string, empId: string, currentName: string) => {
        setEditingRowForName(rowId);
        setEditingEmpId(empId);
        setEditNameValue(currentName);
        setNameModalVisible(true);
    };

    const confirmEditName = () => {
        if (!editNameValue.trim() || !editingRowForName || !editingEmpId) return;
        setRows((prev: ShiftRow[]) =>
            prev.map((r: ShiftRow) =>
                r.id === editingRowForName
                    ? { ...r, employees: r.employees.map((e: ShiftEmployee) => e.id === editingEmpId ? { ...e, name: editNameValue.trim() } : e) }
                    : r
            )
        );
        setNameModalVisible(false);
    };

    // --- Time editing ---
    const openEditTime = (row: ShiftRow) => {
        setEditingRowId(row.id);
        setEditStartTime(row.startTime);
        setEditEndTime(row.endTime);
        setTimeModalVisible(true);
    };

    const confirmEditTime = () => {
        if (!editingRowId) return;
        setRows((prev: ShiftRow[]) =>
            prev.map((r: ShiftRow) =>
                r.id === editingRowId
                    ? { ...r, startTime: editStartTime.trim() || r.startTime, endTime: editEndTime.trim() || r.endTime }
                    : r
            )
        );
        setTimeModalVisible(false);
    };

    // --- Publish ---
    const handlePublish = async () => {
        try {
            setIsLoading(true);
            // Final sync of current rows to weekSchedule
            const finalWeekSchedule = { ...weekSchedule, [selectedDayIdx]: rows };
            const shiftsToSave: any[] = [];
            Object.entries(finalWeekSchedule).forEach(([dayIdx, dayRows]) => {
                const idx = Number(dayIdx);
                const selectedDate = weekDates[idx].fullDate;
                // Use local date string (YYYY-MM-DD) instead of toISOString() which shifts timezone
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                dayRows.forEach(row => {
                    row.employees.forEach(emp => {
                        const parseTime = (timeStr: string) => {
                            const [time, modifier] = timeStr.trim().split(' ');
                            let [hours, minutes] = time.split(':').map(Number);
                            if (modifier === 'PM' && hours < 12) hours += 12;
                            if (modifier === 'AM' && hours === 12) hours = 0;
                            // Create a date object for the specific day at the given hours/minutes in local time
                            const d = new Date(selectedDate);
                            d.setHours(hours, minutes, 0, 0);
                            return d.toISOString();
                        };

                        shiftsToSave.push({
                            date: dateStr,
                            startTime: parseTime(row.startTime),
                            endTime: parseTime(row.endTime),
                            employeeId: emp.id,
                            instructions: row.task,
                            type: 'Standard',
                        });
                    });
                });
            });

            if (shiftsToSave.length === 0) {
                Alert.alert("No Shifts", "Please add at least one shift before publishing.");
                return;
            }

            console.log(`Publishing ${shiftsToSave.length} shifts...`);
            await shiftAPI.createBulkShifts(shiftsToSave);
            Alert.alert("Success", "Roster published successfully!", [
                { text: "OK", onPress: () => router.push('/(manager)/home' as any) }
            ]);
        } catch (error: any) {
            console.error("Publish error:", error);
            const errorMsg = error.response?.data?.error || "An error occurred while publishing.";
            Alert.alert("Publish Failed", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create/Edit Weekly Roster</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Week Label */}
                <Text style={styles.weekLabel}>{weekRangeLabel}</Text>

                {/* Day Selector */}
                <View style={styles.dayRow}>
                    {weekDates.map((day, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.dayCell, selectedDayIdx === idx && styles.dayCellSelected]}
                            onPress={() => handleDayChange(idx)}
                        >
                            <Text style={[styles.dayName, selectedDayIdx === idx && styles.daySel]}>{day.name}</Text>
                            <Text style={[styles.dayNum, selectedDayIdx === idx && styles.daySel]}>{day.date}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Shift Rows (Table) */}
                <View style={styles.shiftList}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.thText, styles.colTime]}>Time</Text>
                        <Text style={[styles.thText, styles.colEmp]}>Employees</Text>
                        <Text style={[styles.thText, styles.colTask]}>Task</Text>
                        <Text style={[styles.thText, styles.colActions]}>Acts</Text>
                    </View>

                    {rows.map((row: ShiftRow) => (
                        <View key={row.id} style={styles.shiftRow}>
                            {/* Time */}
                            <TouchableOpacity style={[styles.td, styles.colTime]} onPress={() => openEditTime(row)}>
                                <Text style={styles.timeText}>{row.startTime}</Text>
                                <Text style={styles.timeText}>to</Text>
                                <Text style={styles.timeText}>{row.endTime}</Text>
                            </TouchableOpacity>

                            {/* Employees */}
                            <TouchableOpacity style={[styles.td, styles.colEmp, { paddingVertical: 6 }]} onPress={() => openAddEmployee(row.id)}>
                                <View style={styles.empWrap}>
                                    {row.employees.map((emp: ShiftEmployee) => (
                                        <TouchableOpacity
                                            key={emp.id}
                                            style={[styles.empChip, { borderColor: emp.color }]}
                                            onPress={() => openEditName(row.id, emp.id, emp.name)}
                                            onLongPress={() => removeEmployee(row.id, emp.id)}
                                        >
                                            <View style={[styles.empAvatar, { backgroundColor: emp.color }]}>
                                                <Ionicons name="person" size={10} color="#fff" />
                                            </View>
                                            <Text style={styles.empName}>{emp.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {row.employees.length === 0 && (
                                        <Text style={styles.noEmpText}>+ Add</Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            {/* Task */}
                            <View style={[styles.td, styles.colTask]}>
                                <TextInput
                                    style={styles.taskInput}
                                    placeholder="Task..."
                                    placeholderTextColor="#999"
                                    multiline
                                    value={row.task}
                                    onChangeText={(val) => {
                                        setRows((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, task: val } : r))
                                        );
                                    }}
                                />
                            </View>

                            {/* Actions */}
                            <View style={[styles.td, styles.colActions, styles.rowActions]}>
                                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]} onPress={() => deleteRow(row.id)}>
                                    <MaterialIcons name="delete" size={16} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Add More and Remove */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                    <TouchableOpacity style={[styles.addMoreBtn, { flex: 1, marginBottom: 0 }]} onPress={addRow}>
                        <Text style={styles.addMoreText}>+ Add More</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addMoreBtn, { flex: 1, marginBottom: 0, backgroundColor: '#e74c3c' }]}
                        onPress={() => {
                            if (rows.length > 0) {
                                deleteRow(rows[rows.length - 1].id);
                            }
                        }}
                    >
                        <Text style={styles.addMoreText}>- Remove</Text>
                    </TouchableOpacity>
                </View>

                {/* Publish */}
                <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
                    <Text style={styles.publishText}>Publish</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Time Modal */}
            <Modal visible={timeModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit Shift Time</Text>
                        <Text style={styles.modalLabel}>Start Time</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editStartTime}
                            onChangeText={setEditStartTime}
                            placeholder="e.g. 08:00 AM"
                            placeholderTextColor="#aaa"
                        />
                        <Text style={styles.modalLabel}>End Time</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editEndTime}
                            onChangeText={setEditEndTime}
                            placeholder="e.g. 09:00 AM"
                            placeholderTextColor="#aaa"
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setTimeModalVisible(false)}>
                                <Text style={styles.modalCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={confirmEditTime}>
                                <Text style={styles.modalConfirmTxt}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Name Modal */}
            <Modal visible={nameModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit Employee Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editNameValue}
                            onChangeText={setEditNameValue}
                            placeholder="Enter name"
                            placeholderTextColor="#aaa"
                            autoFocus
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setNameModalVisible(false)}>
                                <Text style={styles.modalCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={confirmEditName}>
                                <Text style={styles.modalConfirmTxt}>Save</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Delete employee option */}
                        <TouchableOpacity
                            style={styles.deleteEmpBtn}
                            onPress={() => {
                                if (editingRowForName && editingEmpId) {
                                    removeEmployee(editingRowForName, editingEmpId);
                                    setNameModalVisible(false);
                                }
                            }}
                        >
                            <Text style={styles.deleteEmpTxt}>Remove Employee</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Employee Modal (Selection List) */}
            <Modal visible={addEmpModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Select Employee</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {availableEmployees.map((emp) => (
                                <TouchableOpacity
                                    key={emp.id}
                                    style={styles.empSelectItem}
                                    onPress={() => confirmAddEmployee(emp)}
                                >
                                    <View style={[styles.empAvatar, { backgroundColor: '#1565C0', width: 24, height: 24, borderRadius: 12 }]}>
                                        <Ionicons name="person" size={14} color="#fff" />
                                    </View>
                                    <View>
                                        <Text style={styles.empSelectName}>{emp.name}</Text>
                                        <Text style={styles.empSelectDept}>{emp.department}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {availableEmployees.length === 0 && (
                                <Text style={styles.noEmpInfo}>No employees found for this hotel.</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={[styles.modalCancel, { marginTop: 12 }]} onPress={() => setAddEmpModalVisible(false)}>
                            <Text style={styles.modalCancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
    weekLabel: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginTop: 16, marginBottom: 12 },

    // Day selector
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    dayCell: {
        flex: 1, alignItems: 'center', paddingVertical: 8,
        borderRadius: 10, marginHorizontal: 2, backgroundColor: '#f5f7ff',
    },
    dayCellSelected: { backgroundColor: '#1565C0' },
    dayName: { fontSize: 11, color: '#555', fontWeight: '500' },
    dayNum: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
    daySel: { color: '#fff' },

    // Shift rows as Table
    shiftList: {
        marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0',
        borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff',
    },
    tableHeader: {
        flexDirection: 'row', backgroundColor: '#f9fafb',
        borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
        paddingVertical: 10, paddingHorizontal: 4,
    },
    thText: { fontSize: 12, fontWeight: '700', color: '#444', textAlign: 'center' },
    shiftRow: {
        flexDirection: 'row', borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0', alignItems: 'stretch',
    },
    td: {
        justifyContent: 'center', alignItems: 'center', padding: 4,
        borderRightWidth: 1, borderRightColor: '#f0f0f0',
    },

    // Columns (flex weights to distribute horizontally)
    colTime: { flex: 1.5 },
    colEmp: { flex: 3 },
    colTask: { flex: 2.2 },
    colActions: { flex: 1.2, borderRightWidth: 0 },

    timeText: { fontSize: 11, fontWeight: '600', color: '#333', textAlign: 'center' },

    empWrap: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6,
    },
    empChip: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1.2,
        borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4,
        backgroundColor: '#fff',
    },
    empAvatar: {
        width: 16, height: 16, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center', marginRight: 4,
    },
    empName: { fontSize: 10, fontWeight: '600', color: '#1a1a1a' },
    noEmpText: { fontSize: 11, color: '#1565C0', fontStyle: 'italic', paddingVertical: 4 },

    taskInput: {
        width: '100%', minHeight: 44, fontSize: 11, color: '#1a1a1a',
        paddingHorizontal: 4, paddingVertical: 4, textAlign: 'center',
    },

    rowActions: {
        flexDirection: 'row', gap: 4, justifyContent: 'center',
    },
    actionBtn: {
        width: 30, height: 30, borderRadius: 8, backgroundColor: '#EEF2FF',
        justifyContent: 'center', alignItems: 'center',
    },

    // Add More
    addMoreBtn: {
        backgroundColor: '#1565C0', borderRadius: 10,
        paddingVertical: 14, alignItems: 'center', marginBottom: 14,
    },
    addMoreText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Publish
    publishBtn: {
        backgroundColor: '#1565C0', borderRadius: 10,
        paddingVertical: 16, alignItems: 'center',
    },
    publishText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24,
        width: '82%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
    },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
    modalLabel: { fontSize: 13, color: '#555', marginBottom: 4 },
    modalInput: {
        borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a',
        marginBottom: 14,
    },
    modalBtns: { flexDirection: 'row', gap: 10 },
    modalCancel: {
        flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
        paddingVertical: 12, alignItems: 'center',
    },
    modalCancelTxt: { color: '#555', fontWeight: '600' },
    modalConfirm: {
        flex: 1, backgroundColor: '#1565C0', borderRadius: 10,
        paddingVertical: 12, alignItems: 'center',
    },
    modalConfirmTxt: { color: '#fff', fontWeight: '700' },
    deleteEmpBtn: { marginTop: 12, alignItems: 'center' },
    deleteEmpTxt: { color: '#e74c3c', fontWeight: '600', fontSize: 13 },
    empSelectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    empSelectName: {
        fontSize: 15,
        color: '#1a1a1a',
        fontWeight: '600',
    },
    empSelectDept: {
        fontSize: 12,
        color: '#666',
    },
    noEmpInfo: {
        textAlign: 'center',
        color: '#888',
        paddingVertical: 20,
    },
});
