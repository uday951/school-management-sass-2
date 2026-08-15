import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function AttendanceScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await principalApi.getAttendanceStats();
        setStats(res.data?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <ScreenContainer title="Attendance Summary" loading={loading} scrollable>
      <View style={styles.card}>
        <Text style={styles.title}>Today's Statistics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Student Attendance</Text>
          <Text style={styles.value}>{stats?.studentAttendancePercent ? `${stats.studentAttendancePercent}%` : 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Teacher Attendance</Text>
          <Text style={styles.value}>{stats?.teacherAttendancePercent ? `${stats.teacherAttendancePercent}%` : 'N/A'}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  },
  value: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  }
});
