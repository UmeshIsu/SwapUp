import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ManagerColors } from '@/src/constants/managerColors';
import { WeeklyShiftSummary } from '@/src/types/manager';
import { getWeekDays } from '@/src/utils/dateUtils';

interface WeeklyOverviewProps {
  summary: WeeklyShiftSummary[];
}

export function WeeklyOverview({ summary }: WeeklyOverviewProps) {
  const weekDays = getWeekDays();
  const maxShifts = Math.max(...summary.map((s) => s.totalShifts), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>weekly shift coverage</Text>
      <View style={styles.card}>
        <View style={styles.barsRow}>
          {summary.map((item, i) => {
            const isToday = weekDays[i]?.isToday ?? false;
            const coveredPct = item.totalShifts > 0 ? item.covered / item.totalShifts : 0;
            const barHeight = Math.max(8, (item.totalShifts / maxShifts) * 72);
            const uncoveredHeight = barHeight * (1 - coveredPct);

            return (
              <View key={item.day} style={styles.barCol}>
                <View style={[styles.barWrapper, { height: 72 }]}>
                  <View style={[styles.bar, { height: barHeight }]}>
                    <View
                      style={[
                        styles.uncoveredBar,
                        { height: uncoveredHeight, backgroundColor: ManagerColors.dangerLight },
                      ]}
                    />
                    <View
                      style={[
                        styles.coveredBar,
                        {
                          flex: 1,
                          backgroundColor: isToday ? ManagerColors.primary : ManagerColors.primaryLight,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {item.day}
                </Text>
                {isToday && <View style={styles.todayDot} />}
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ManagerColors.primary }]} />
            <Text style={styles.legendText}>covered</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ManagerColors.dangerLight }]} />
            <Text style={styles.legendText}>uncovered</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: ManagerColors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: ManagerColors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  barWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  coveredBar: {
    width: '100%',
  },
  uncoveredBar: {
    width: '100%',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: ManagerColors.neutral[400],
  },
  dayLabelToday: {
    color: ManagerColors.primary,
    fontWeight: '700',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ManagerColors.primary,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: ManagerColors.neutral[100],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: ManagerColors.neutral[400],
    fontWeight: '500',
  },
});
