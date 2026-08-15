import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function HomeScreen() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        const res = await principalApi.getKPIs();
        setKpis(res.data?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  return (
    <ScreenContainer title="Principal Workspace" loading={loading} scrollable>
      <View style={styles.card}>
        <Text style={styles.title}>School ERP Stats Indicator</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Active Students</Text>
            <Text style={styles.value}>{kpis?.studentKPIs?.activeCount ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Registered Teachers</Text>
            <Text style={styles.value}>{kpis?.teacherKPIs?.totalTeachers ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Attendance Rate</Text>
            <Text style={styles.value}>{kpis?.attendanceKPIs?.studentAttendancePercent ? `${kpis.attendanceKPIs.studentAttendancePercent}%` : 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Collections Today</Text>
            <Text style={styles.value}>${kpis?.financeKPIs?.todayCollection ?? 0}</Text>
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
