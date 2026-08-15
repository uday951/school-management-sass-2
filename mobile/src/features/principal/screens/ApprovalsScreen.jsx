import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function ApprovalsScreen() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await principalApi.getLeavesPending();
      setLeaves(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await principalApi.updateLeaveStatus(id, status);
      Alert.alert('Status Updated', `Leave application status set to ${status}.`);
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', 'Unable to complete leave status update.');
    }
  };

  return (
    <ScreenContainer title="Pending Approvals" loading={loading}>
      <FlatList
        data={leaves}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Pending Requests" message="There are no pending leaves or approvals in the queue." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.applicantName}>{item.applicantName || 'Teacher'}</Text>
            <Text style={styles.reason}>Reason: {item.reason}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleUpdateStatus(item._id || item.id, 'approved')}>
                <Text style={styles.btnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleUpdateStatus(item._id || item.id, 'rejected')}>
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
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
  applicantName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 4
  },
  reason: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.md
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  btn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: theme.spacing.sm
  },
  approveBtn: {
    backgroundColor: theme.colors.light.secondary
  },
  rejectBtn: {
    backgroundColor: theme.colors.light.error
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold
  }
});
