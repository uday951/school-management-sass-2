import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function LeaveScreen() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getLeaveHistory();
      setLeaves(res.data?.data?.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async () => {
    if (!reason || !startDate || !endDate) {
      Alert.alert('Required Info', 'Please specify startDate, endDate and reason.');
      return;
    }
    try {
      await teacherApi.applyLeave({
        leaveType: 'casual',
        startDate,
        endDate,
        reason
      });
      setReason('');
      setStartDate('');
      setEndDate('');
      Alert.alert('Success', 'Leave application submitted.');
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', 'Unable to submit leave request.');
    }
  };

  return (
    <ScreenContainer title="Leave Request Desk" loading={loading} scrollable>
      <View style={styles.form}>
        <Text style={styles.formTitle}>Apply for Leave</Text>
        <TextInput
          style={styles.input}
          placeholder="Start Date (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.light.textMuted}
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          style={styles.input}
          placeholder="End Date (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.light.textMuted}
          value={endDate}
          onChangeText={setEndDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Specify reason details"
          placeholderTextColor={theme.colors.light.textMuted}
          value={reason}
          onChangeText={setReason}
        />
        <TouchableOpacity style={styles.applyBtn} onPress={handleApplyLeave}>
          <Text style={styles.applyBtnText}>Submit Request</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Application History</Text>
      <FlatList
        scrollEnabled={false}
        data={leaves}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Records" message="You have no leave requests submitted in the history tracker." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dates}>
                {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
              </Text>
              <View style={[styles.badge, item.status === 'approved' ? styles.approved : item.status === 'rejected' ? styles.rejected : styles.pending]}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'PENDING'}</Text>
              </View>
            </View>
            <Text style={styles.reason}>Reason: {item.reason}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  formTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 6,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.background
  },
  applyBtn: {
    height: 40,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold
  },
  historyTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4
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
    marginBottom: 6
  },
  dates: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4
  },
  approved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  rejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  pending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  reason: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  }
});
