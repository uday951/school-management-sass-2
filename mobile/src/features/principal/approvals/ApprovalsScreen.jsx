import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApprovalsScreen() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      const res = await principalApi.getLeavesPending();
      setLeaves(res.data?.data || []);
    } catch (error) {
      console.error(error);
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

  const handleAction = async (id, status) => {
    setProcessingId(id);
    try {
      await principalApi.updateLeaveStatus(id, status);
      Alert.alert('Success', `Leave application has been ${status}.`);
      fetchLeaves(); // Refresh list
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update leave status.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const id = item._id || item.id;
    const isProcessing = processingId === id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.teacherName || item.employeeName}</Text>
          <Text style={styles.leaveType}>{item.leaveType || item.type}</Text>
        </View>
        <Text style={styles.detail}>Dates: {item.startDate} to {item.endDate}</Text>
        <Text style={styles.detail}>Duration: {item.duration} days</Text>
        <Text style={styles.reason}>Reason: {item.reason}</Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btn, styles.rejectBtn, isProcessing && styles.disabledBtn]}
            disabled={isProcessing}
            onPress={() => handleAction(id, 'rejected')}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.approveBtn, isProcessing && styles.disabledBtn]}
            disabled={isProcessing}
            onPress={() => handleAction(id, 'approved')}
          >
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={leaves}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending approvals.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  leaveType: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  detail: { fontSize: 14, color: '#555', marginBottom: 4 },
  reason: { fontSize: 14, color: '#333', fontStyle: 'italic', marginVertical: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginLeft: 12 },
  rejectBtn: { backgroundColor: '#ffebee' },
  rejectText: { color: theme.colors.error, fontWeight: 'bold' },
  approveBtn: { backgroundColor: theme.colors.primary },
  approveText: { color: '#fff', fontWeight: 'bold' },
  disabledBtn: { opacity: 0.5 }
});
