import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { theme } from '../../theme';

export default function DatePickerModal({ visible, onClose, onSelectDate, title = 'Select Date' }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const formatDateString = (year, month, day) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleConfirm = () => {
    const formatted = formatDateString(currentYear, currentMonth, selectedDay);
    onSelectDate(formatted);
    onClose();
  };

  const handleQuickPreset = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    setCurrentYear(y);
    setCurrentMonth(m);
    setSelectedDay(day);
    onSelectDate(formatDateString(y, m, day));
    onClose();
  };

  const totalDays = daysInMonth(currentMonth, currentYear);
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= totalDays; day++) {
    calendarCells.push(day);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetChip} onPress={() => handleQuickPreset(0)}>
              <Text style={styles.presetText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={() => handleQuickPreset(1)}>
              <Text style={styles.presetText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={() => handleQuickPreset(7)}>
              <Text style={styles.presetText}>Next Week</Text>
            </TouchableOpacity>
          </View>

          {/* Month / Year Controls */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>‹ Prev</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Next ›</Text>
            </TouchableOpacity>
          </View>

          {/* Days of Week Header */}
          <View style={styles.weekHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, idx) => (
              <Text key={idx} style={styles.weekHeaderText}>{w}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.grid}>
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <View key={index} style={styles.dayCellEmpty} />;
              }
              const isSelected = day === selectedDay;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayCell, isSelected && styles.selectedCell]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Set Selected Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.light.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    ...theme.shadows.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  closeText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.light.textMuted,
    fontWeight: theme.typography.weights.bold
  },
  presetRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm
  },
  presetChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.light.primary + '15',
    marginRight: 6
  },
  presetText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.primary
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.xs
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  navBtnText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.bold
  },
  monthTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4
  },
  weekHeaderText: {
    width: 40,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.textMuted
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginVertical: 4
  },
  dayCellEmpty: {
    width: 40,
    height: 36
  },
  dayCell: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginVertical: 2
  },
  selectedCell: {
    backgroundColor: theme.colors.light.primary
  },
  dayText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.text
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.weights.bold
  },
  confirmBtn: {
    height: 40,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold
  }
});
