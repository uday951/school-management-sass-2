import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import useChildStore from '../../../store/childStore';
import { theme } from '../../../theme';

export default function AttendanceScreen() {
  const { activeChild } = useChildStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      const childId = activeChild?._id || activeChild?.id;
      if (!childId) return;
      setLoading(true);
      try {
        const res = await parentApi.getChildAttendance(childId);
        setRecords(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [activeChild]);

  return (
    <ScreenContainer title="Attendance History" loading={loading}>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Attendance Logs" message="No attendance records registered for this child." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.date}>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</Text>
            <View style={[styles.badge, item.status === 'present' ? styles.present : styles.absent]}>
              <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  date: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.light.text,
    fontWeight: theme.typography.weights.medium
  },
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 4
  },
  present: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  absent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  }
});
