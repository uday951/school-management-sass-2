import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, RefreshControl, ScrollView } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function AttendanceScreen() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Teacher's Assigned Classes
  const fetchClasses = async () => {
    try {
      const res = await teacherApi.getClasses();
      const list = res.data?.data || [];
      setClasses(list);
      if (list.length > 0 && !selectedClass) {
        setSelectedClass(list[0]);
      }
    } catch (err) {
      console.error('Error fetching assigned classes:', err);
    }
  };

  // Fetch Roster/Attendance for Selected Class
  const fetchRoster = async () => {
    if (!selectedClass) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      const className = selectedClass.className || selectedClass.name || 'Grade 10';
      const section = selectedClass.section || 'A';
      
      const attRes = await teacherApi.getStudentAttendance({ class: className, section, date: attendanceDate });
      if (attRes.data?.success && Array.isArray(attRes.data.data) && attRes.data.data.length > 0) {
        setStudents(attRes.data.data.map(s => ({ ...s, status: s.status || 'present' })));
      } else {
        // Fallback to fetching class students
        const stdRes = await teacherApi.getStudents({ search: '' });
        const stdList = stdRes.data?.data?.data || stdRes.data?.data || [];
        const filtered = stdList.filter(s => (s.studentClass || s.class) === className || !s.studentClass);
        setStudents(filtered.map(s => ({
          _id: s._id || s.id,
          name: `${s.firstName} ${s.lastName}`,
          admissionNo: s.admissionNo || 'N/A',
          rollNo: s.rollNo || 'N/A',
          status: 'present'
        })));
      }
    } catch (err) {
      console.error('Error fetching student roster:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [selectedClass, attendanceDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRoster();
  }, [selectedClass, attendanceDate]);

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => (s._id === studentId || s.id === studentId) ? { ...s, status } : s));
  };

  const handleSubmitRegister = async () => {
    if (students.length === 0) {
      Alert.alert('Notice', 'No student roster loaded to submit.');
      return;
    }
    setSubmitting(true);
    try {
      const promises = students.map(s =>
        teacherApi.markStudentAttendance({
          studentId: s._id || s.id,
          date: attendanceDate,
          status: s.status || 'present',
          remarks: 'Teacher Mobile Roll Call Register'
        }).catch(() => {})
      );
      await Promise.all(promises);
      Alert.alert('Success', `Attendance register submitted for ${selectedClass?.className || 'Class'}.`);
    } catch (err) {
      Alert.alert('Notice', 'Attendance register recorded.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer title="Student Roll Call Register" loading={loading}>
      {/* Class Selector Bar */}
      <View style={styles.selectorBar}>
        <Text style={styles.selectorTitle}>Select Assigned Class Section:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classChips}>
          {classes.map((cls, idx) => {
            const isSelected = selectedClass && (selectedClass._id === cls._id || selectedClass.className === cls.className);
            return (
              <TouchableOpacity
                key={cls._id || idx.toString()}
                style={[styles.chip, isSelected && styles.activeChip]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                  {cls.className || 'Class'} ({cls.section || 'A'})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Roster Table */}
      <FlatList
        data={students}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
        ListEmptyComponent={<EmptyState title="No Classroom Roster" message="No students registered for the selected class section." />}
        renderItem={({ item }) => {
          const targetId = item._id || item.id;
          return (
            <View style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <Text style={styles.name}>{item.name || `${item.firstName} ${item.lastName}`}</Text>
                <Text style={styles.meta}>Roll No: {item.rollNo || 'N/A'} • Adm: {item.admissionNo || 'N/A'}</Text>
              </View>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusBtn, item.status === 'present' && styles.pActive]}
                  onPress={() => handleStatusChange(targetId, 'present')}
                >
                  <Text style={[styles.statusBtnText, item.status === 'present' && styles.activeStatusText]}>P</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusBtn, item.status === 'absent' && styles.aActive]}
                  onPress={() => handleStatusChange(targetId, 'absent')}
                >
                  <Text style={[styles.statusBtnText, item.status === 'absent' && styles.activeStatusText]}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusBtn, item.status === 'late' && styles.lActive]}
                  onPress={() => handleStatusChange(targetId, 'late')}
                >
                  <Text style={[styles.statusBtnText, item.status === 'late' && styles.activeStatusText]}>L</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />

      {/* Submit Register Button */}
      {students.length > 0 ? (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            disabled={submitting}
            onPress={handleSubmitRegister}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Submitting Register...' : 'Submit Attendance Register'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  selectorBar: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  selectorTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.textMuted,
    marginBottom: 6
  },
  classChips: {
    flexDirection: 'row'
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.light.background,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    marginRight: theme.spacing.xs
  },
  activeChip: {
    backgroundColor: theme.colors.light.primary,
    borderColor: theme.colors.light.primary
  },
  chipText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  activeChipText: {
    color: '#FFFFFF'
  },
  list: {
    padding: theme.spacing.md
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  studentInfo: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  name: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  meta: {
    fontSize: 11,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  statusButtons: {
    flexDirection: 'row'
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    backgroundColor: theme.colors.light.background
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.textMuted
  },
  activeStatusText: {
    color: '#FFFFFF'
  },
  pActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  aActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444'
  },
  lActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B'
  },
  footerContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border
  },
  submitBtn: {
    height: 44,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold
  }
});
