import { palette } from '@/src/constants/palette';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import ScreenHeader from '@/src/components/ScreenHeader';

export default function EmployeeScheduleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; rosterDates?: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selected, setSelected] = useState(params.date ?? '');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allShifts, setAllShifts] = useState<any[]>([]);

  // Refs for the Bottom Sheet
  const sheetRef = useRef<BottomSheet>(null);
  const rosterDates = params.rosterDates ? String(params.rosterDates).split(',').filter(Boolean) : [];

  useEffect(() => {
    if (params.date) {
      setSelected(String(params.date));
    }
  }, [params.date]);

  const TYPE_COLORS: { [key: string]: string } = {
    'Morning': '#FDE68A',
    'Afternoon': '#FDBA74',
    'Night': palette.primary,
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
  };

  const handleInitiateSwap = (shift: any) => {
    router.push({
      pathname: '/(employee)/swap/initiate',
      params: { date: shift.date.split('T')[0] }
    });
  };

  // All shifts on the selected day (a day can have more than one).
  const dayShifts = selected
    ? allShifts.filter((s: any) => s.date.split('T')[0] === selected)
    : [];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader
        title="Full Schedule"
        right={
          <TouchableOpacity onPress={handleOpenShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="share-outline" color={palette.primary} size={22} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {rosterDates.length > 0 ? (
          <View style={[styles.rosterBanner, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            <Text style={[styles.rosterBannerTitle, { color: theme.text }]}>New roster published</Text>
            <Text style={[styles.rosterBannerText, { color: theme.textSecondary }]}>
              Published for {rosterDates.length} day{rosterDates.length > 1 ? 's' : ''}: {rosterDates.map((date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')}
            </Text>
          </View>
        ) : null}

        <View style={[styles.calendarCard, { backgroundColor: theme.surface }]}>
          {loading && <ActivityIndicator style={styles.loader} color={theme.primary} />}
          <Calendar
            key={colorScheme}
            theme={{
              calendarBackground: 'transparent',
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDayFontWeight: '500',
              monthTextColor: theme.text,
              textMonthFontWeight: '700',
              textSectionTitleColor: theme.textSecondary,
              textDisabledColor: theme.textMuted,
              arrowColor: theme.primary,
            }}
            onDayPress={handleDayPress}
            onMonthChange={(date) => fetchShifts(date.month, date.year)}
            markedDates={{
              ...markedDates,
              [selected]: { ...markedDates[selected], selected: true, selectedColor: palette.primary },
            }}
          />
        </View>

        <View style={[styles.legendContainer, { backgroundColor: theme.surface }]}>
          {Object.entries(TYPE_COLORS).map(([label, color]) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>{label} Shifts</Text>
            </View>
          ))}
        </View>

        {dayShifts.length > 0 ? (
          dayShifts.map((shift: any) => (
            <View key={shift.id} style={[styles.shiftDetailCard, { backgroundColor: theme.surface }]}>
              <View style={styles.shiftInfo}>
                <Text style={[styles.shiftDetailTitle, { color: theme.text }]}>{getShiftType(shift.startTime)} Shift</Text>
                <Text style={[styles.shiftTime, { color: theme.textSecondary }]}>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</Text>
                <Text style={[styles.shiftDetailDate, { color: theme.textMuted }]}>{(() => {
                  const [year, month, day] = shift.date.split('T')[0].split('-').map(Number);
                  const d = new Date(year, month - 1, day);
                  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                })()}</Text>
              </View>
              <TouchableOpacity style={[styles.swapActionBtn, { backgroundColor: theme.primary }]} onPress={() => handleInitiateSwap(shift)}>
                <Text style={styles.swapActionText}>Initiate Shift Swap</Text>
                <Ionicons name="swap-horizontal" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))
        ) : selected ? (
          <View style={[styles.infoBox, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.infoTitle, { color: '#B91C1C' }]}>No shift scheduled for this date.</Text>
          </View>
        ) : null}

        <View style={[styles.infoBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>To request a swap, please click on the relevant date in the calendar.</Text>
          <Text style={[styles.infoSub, { color: theme.textMuted }]}>
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
  rosterBanner: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
  rosterBannerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  rosterBannerText: { fontSize: 13, lineHeight: 18 },
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
    backgroundColor: palette.primary,
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
