import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function LeaveScreen() {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({ total: 15, used: 0, available: 15 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await teacherApi.getLeaveHistory();
      const data = res.data?.data;
      setLeaves(data?.leaves || []);
      if (data?.balances) {
        setBalances(data.balances);
      }
    } catch (err) {
      console.error('Error fetching leave history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaves();
  }, []);

  const handleApplyLeave = async () => {
    if (!startDate.trim() || !endDate.trim() || !reason.trim()) {
      Alert.alert('Validation Error', 'Please fill in Start Date, End Date, and Reason.');
      return;
    }
    setSubmitting(true);
    try {
      await teacherApi.applyLeave({
        leaveType,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        reason: reason.trim()
      });
      Alert.alert('Success', 'Leave application submitted successfully.');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', 'Unable to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer title="Leave Management Desk" loading={loading} scrollable>
      {/* Leave Balances Cards */}
      <View style={styles.balanceGrid}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Allowed</Text>
          <Text style={styles.balanceValue}>{balances.total}</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Used</Text>
          <Text style={[styles.balanceValue, { color: theme.colors.light.error }]}>{balances.used}</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available</Text>
          <Text style={[styles.balanceValue, { color: '#10B981' }]}>{balances.available}</Text>
        </View>
      </View>

      {/* Apply Form */}
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
        <TouchableOpacity
          style={[styles.applyBtn, submitting && styles.btnDisabled]}
          disabled={submitting}
          onPress={handleApplyLeave}
        >
          <Text style={styles.applyBtnText}>{submitting ? 'Submitting...' : 'Submit Leave Request'}</Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      <Text style={styles.historyTitle}>Leave Application History</Text>
      <FlatList
        scrollEnabled={false}
        data={leaves}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
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
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md
  },
  balanceCard: {
    flex: 1,
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  balanceLabel: {
    fontSize: 11,
    color: theme.colors.light.textMuted,
    marginBottom: 2
  },
  balanceValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  form: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
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
    height: 38,
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
  btnDisabled: {
    opacity: 0.6
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
    paddingHorizontal: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
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
