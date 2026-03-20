import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { shiftAPI } from '@/src/services/api';
import BottomSheet from '@gorhom/bottom-sheet';
import ShareSheet from '@/src/components/ShareSheet';
import SuccessModal from '@/src/components/SuccessModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function EmployeeScheduleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [allShifts, setAllShifts] = useState<any[]>([]);
  
  // Refs for the Bottom Sheet
  const sheetRef = useRef<BottomSheet>(null);

  const TYPE_COLORS: { [key: string]: string } = {
    'Morning': '#FDE68A',
    'Afternoon': '#FDBA74',
    'Night': '#3B82F6',
  };

  const getShiftType = (startTime: string) => {
    try {
      const date = new Date(startTime);
      const hours = date.getHours();
      if (hours >= 4 && hours < 12) return 'Morning';
      if (hours >= 12 && hours < 20) return 'Afternoon';
      return 'Night';
    } catch {
      return 'Morning';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const fetchShifts = async (month: number, year: number) => {
    if (!user?.id) return;
    
    setLoading(true);
    const startOfMonth = new Date(year, month - 1, 1).toISOString();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();

    const response = await shiftAPI.getMyShifts();
    const data = response.data;

    if (data) {
      const marks: any = {};
      data.forEach((shift: any) => {
        const dateStr = shift.date.split('T')[0];
        const computedType = getShiftType(shift.startTime);
        marks[dateStr] = {
          marked: true,
          dotColor: TYPE_COLORS[computedType] || '#9CA3AF', 
        };
      });
      setMarkedDates(marks);
      setAllShifts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const now = new Date();
    fetchShifts(now.getMonth() + 1, now.getFullYear());
  }, [user?.id]);

  const handleOpenShare = () => sheetRef.current?.expand();
  
  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await shiftAPI.exportToICS();
      const icsContent = response.data;

      const fileUri = `${FileSystem.cacheDirectory}schedule.ics`;
      await FileSystem.writeAsStringAsync(fileUri, icsContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Export Schedule',
          UTI: 'public.calendar-event',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
      
      sheetRef.current?.close();
      setShowSuccess(true);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'An error occurred while exporting the schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day: any) => {
    setSelected(day.dateString);
    const shift = allShifts.find(s => s.date.split('T')[0] === day.dateString);
    setSelectedShift(shift || null);
  };

  const handleInitiateSwap = () => {
    if (selectedShift) {
      router.push({
        pathname: '/(employee)/swap/initiate',
        params: { date: selectedShift.date.split('T')[0] }
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" color="#000" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Full Schedule</Text>
          <TouchableOpacity onPress={handleOpenShare}>
            <Ionicons name="share-outline" color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarCard}>
          {loading && <ActivityIndicator style={styles.loader} color="#3B82F6" />}
          <Calendar
            theme={{
              calendarBackground: 'transparent',
              selectedDayBackgroundColor: '#3B82F6',
              todayTextColor: '#3B82F6',
            }}
            onDayPress={handleDayPress}
            onMonthChange={(date) => fetchShifts(date.month, date.year)}
            markedDates={{
              ...markedDates,
              [selected]: { ...markedDates[selected], selected: true, selectedColor: '#3B82F6' },
            }}
          />
        </View>

        <View style={styles.legendContainer}>
          {Object.entries(TYPE_COLORS).map(([label, color]) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label} Shifts</Text>
            </View>
          ))}
        </View>

        {selectedShift ? (
          <View style={styles.shiftDetailCard}>
            <View style={styles.shiftInfo}>
              <Text style={styles.shiftDetailTitle}>{getShiftType(selectedShift.startTime)} Shift</Text>
              <Text style={styles.shiftTime}>{formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}</Text>
              <Text style={styles.shiftDetailDate}>{(() => {
                const [year, month, day] = selectedShift.date.split('T')[0].split('-').map(Number);
                const d = new Date(year, month - 1, day);
                return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              })()}</Text>
            </View>
            <TouchableOpacity style={styles.swapActionBtn} onPress={handleInitiateSwap}>
              <Text style={styles.swapActionText}>Initiate Shift Swap</Text>
              <Ionicons name="swap-horizontal" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : selected && (
          <View style={[styles.infoBox, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.infoTitle, { color: '#B91C1C' }]}>No shift scheduled for this date.</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>To request a swap, please click on the relevant date in the calendar.</Text>
          <Text style={styles.infoSub}>
            Please note: shift swap request must be made at least 7 days in advance.
          </Text>
        </View>
      </ScrollView>

      <ShareSheet sheetRef={sheetRef} onExport={handleExport} />
      <SuccessModal visible={showSuccess} onClose={() => setShowSuccess(false)} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  calendarCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  loader: { position: 'absolute', top: '50%', left: '50%', zIndex: 1, marginLeft: -10, marginTop: -10 },
  legendContainer: { marginTop: 25, backgroundColor: '#F1F5F9', borderRadius: 20, padding: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 15 },
  legendText: { fontSize: 15, color: '#475569', fontWeight: '500' },
  infoBox: { marginTop: 20, padding: 20, backgroundColor: '#E2E8F0', borderRadius: 20, marginBottom: 30 },
  infoTitle: { fontWeight: '700', marginBottom: 10 },
  infoSub: { fontSize: 13, color: '#64748B' },
  shiftDetailCard: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  shiftDetailDate: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  swapActionBtn: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  swapActionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
