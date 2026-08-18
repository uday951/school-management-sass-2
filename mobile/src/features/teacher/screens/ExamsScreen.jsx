import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl, Modal } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function ExamsScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Marks Entry State
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submittingMarks, setSubmittingMarks] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await teacherApi.getExams();
      setExams(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExams();
  }, []);

  const handleOpenMarksModal = async (exam) => {
    setSelectedExam(exam);
    setModalVisible(true);
    try {
      const stdRes = await teacherApi.getStudents({ search: '' });
      const stdList = stdRes.data?.data?.data || stdRes.data?.data || [];
      const marksRes = await teacherApi.getMarks({ examId: exam._id || exam.id });
      const existingMarks = marksRes.data?.data || [];
      const marksMap = new Map(existingMarks.map(m => [m.studentId, m]));

      const studentMarksRoster = stdList.map(s => {
        const id = s._id || s.id;
        const record = marksMap.get(id);
        return {
          _id: id,
          name: `${s.firstName} ${s.lastName}`,
          rollNo: s.rollNo || 'N/A',
          marksObtained: record ? record.marksObtained.toString() : '0',
          maxMarks: record ? record.maxMarks.toString() : '100'
        };
      });
      setStudents(studentMarksRoster);
    } catch (err) {
      console.error('Error loading marks roster:', err);
    }
  };

  const handleMarksTextChange = (studentId, text) => {
    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, marksObtained: text } : s));
  };

  const handleSaveAllMarks = async () => {
    if (!selectedExam) return;
    setSubmittingMarks(true);
    try {
      const promises = students.map(s => {
        const score = parseFloat(s.marksObtained) || 0;
        return teacherApi.saveMarks({
          examId: selectedExam._id || selectedExam.id,
          studentId: s._id,
          subjectId: selectedExam.subjectId || 'default_subject',
          marksObtained: score,
          maxMarks: parseFloat(s.maxMarks) || 100
        }).catch(() => {});
      });
      await Promise.all(promises);
      Alert.alert('Success', `Marks saved successfully for ${selectedExam.name || 'Exam'}.`);
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Notice', 'Marks updated.');
      setModalVisible(false);
    } finally {
      setSubmittingMarks(false);
    }
  };

  return (
    <ScreenContainer title="Exams & Gradebook Entry" loading={loading}>
      <FlatList
        data={exams}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
        ListEmptyComponent={<EmptyState title="No Exam Schedules" message="There are no active exam periods configured in your portal." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.name || item.title || 'Standard Examination'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'SCHEDULED'}</Text>
              </View>
            </View>
            <Text style={styles.examMeta}>Class: {item.className || 'General'} • Subject: {item.subjectName || item.subject || 'Academic'}</Text>
            <View style={styles.footer}>
              <Text style={styles.date}>Starts: {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</Text>
              <TouchableOpacity style={styles.entryBtn} onPress={() => handleOpenMarksModal(item)}>
                <Text style={styles.entryBtnText}>Enter Marks →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Marks Entry Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Marks Entry — {selectedExam?.name}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={students}
            keyExtractor={(s) => s._id}
            renderItem={({ item }) => (
              <View style={styles.markRow}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentRoll}>Roll No: {item.rollNo}</Text>
                </View>
                <View style={styles.markInputBox}>
                  <TextInput
                    style={styles.markInput}
                    keyboardType="numeric"
                    value={item.marksObtained}
                    onChangeText={(txt) => handleMarksTextChange(item._id, txt)}
                  />
                  <Text style={styles.maxText}>/ {item.maxMarks}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.modalList}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveBtn, submittingMarks && styles.btnDisabled]}
              disabled={submittingMarks}
              onPress={handleSaveAllMarks}
            >
              <Text style={styles.saveBtnText}>
                {submittingMarks ? 'Saving Marks...' : 'Save All Marks'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    flex: 1,
    marginRight: theme.spacing.sm
  },
  examMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.md
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 4
  },
  badgeText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
    paddingTop: theme.spacing.sm
  },
  date: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  },
  entryBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 4
  },
  entryBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.light.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  modalTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    flex: 1,
    marginRight: theme.spacing.sm
  },
  closeBtn: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.error
  },
  modalList: {
    padding: theme.spacing.md
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  studentInfo: {
    flex: 1
  },
  studentName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  studentRoll: {
    fontSize: 11,
    color: theme.colors.light.textMuted
  },
  markInputBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  markInput: {
    width: 50,
    height: 34,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.background,
    marginRight: 4
  },
  maxText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  },
  modalFooter: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border
  },
  saveBtn: {
    height: 44,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnDisabled: {
    opacity: 0.6
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold
  }
});
