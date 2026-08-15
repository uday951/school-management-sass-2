import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getReports();
        setDashboard(res.data?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <ScreenContainer title="Teacher Dashboard" loading={loading} scrollable>
      <View style={styles.card}>
        <Text style={styles.title}>Workspace Overview</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Assigned Class Count</Text>
            <Text style={styles.value}>{dashboard?.analytics?.attendanceSummary?.length || 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Students Assigned</Text>
            <Text style={styles.value}>{dashboard?.studentCount || 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Active Homework Tasks</Text>
            <Text style={styles.value}>{dashboard?.homeworkCount || 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Average Grade Index</Text>
            <Text style={styles.value}>{dashboard?.gradesAverage || 'N/A'}</Text>
          </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -theme.spacing.xs
  },
  gridItem: {
    width: '50%',
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: 4
  },
  value: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  }
});
