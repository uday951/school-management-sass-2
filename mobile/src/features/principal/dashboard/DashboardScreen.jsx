import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function DashboardScreen() {
  const [kpis, setKpis] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [kpiRes, activityRes] = await Promise.all([
          principalApi.getKPIs(),
          principalApi.getActivity().catch(() => ({ data: { data: [] } }))
        ]);
        setKpis(kpiRes.data?.data || null);
        
        const rawActivity = activityRes.data?.data || {};
        const combinedActivities = [
          ...(rawActivity.recentAdmissions || []).map(item => ({
            description: `Admitted student: ${item.firstName} ${item.lastName} to class ${item.studentClass || item.class || 'N/A'}`,
            time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
          })),
          ...(rawActivity.recentPayments || []).map(item => ({
            description: `Fee Payment Received: $${item.amount || 0} for ${item.studentName || 'Student'}`,
            time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
          })),
          ...(rawActivity.recentAttendance || []).map(item => ({
            description: `Attendance logged for Class ${item.className || ''}`,
            time: item.date ? new Date(item.date).toLocaleDateString() : ''
          }))
        ];
        setActivities(combinedActivities);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <ScreenContainer title="Principal Dashboard" loading={loading} scrollable>
      
      {/* School Summary Grid */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>School Summary</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Students</Text>
            <Text style={styles.value}>{kpis?.studentKPIs?.activeCount ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Teachers</Text>
            <Text style={styles.value}>{kpis?.teacherKPIs?.totalTeachers ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Classes</Text>
            <Text style={styles.value}>{kpis?.academicKPIs?.totalClasses ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Parents</Text>
            <Text style={styles.value}>{kpis?.parentKPIs?.activeParents ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Attendance Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Attendance Overview</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Present</Text>
            <Text style={[styles.value, { color: theme.colors.light.success }]}>{kpis?.attendanceKPIs?.presentCount ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Absent</Text>
            <Text style={[styles.value, { color: theme.colors.light.danger }]}>{kpis?.attendanceKPIs?.absentCount ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Late</Text>
            <Text style={[styles.value, { color: theme.colors.light.warning }]}>{kpis?.attendanceKPIs?.lateCount ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Percentage</Text>
            <Text style={styles.value}>{kpis?.attendanceKPIs?.studentAttendancePercent ? `${kpis.attendanceKPIs.studentAttendancePercent}%` : 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Admissions KPI */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Admissions KPI</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>New Inquiries</Text>
            <Text style={styles.value}>{kpis?.admissionKPIs?.newInquiries ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Completed</Text>
            <Text style={styles.value}>{kpis?.admissionKPIs?.completed ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Finance & Fees */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Finance & Fees</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Collection Today</Text>
            <Text style={styles.value}>${kpis?.financeKPIs?.todayCollection ?? 0}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Pending Dues</Text>
            <Text style={[styles.value, { color: theme.colors.light.danger }]}>${kpis?.financeKPIs?.pendingDues ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Academics & Transport */}
      <View style={styles.row}>
        <View style={[styles.card, { flex: 1, marginRight: theme.spacing.xs }]}>
          <Text style={styles.sectionTitle}>Academics</Text>
          <Text style={styles.label}>Upcoming Exams</Text>
          <Text style={styles.value}>{kpis?.academicKPIs?.upcomingExams ?? 0}</Text>
        </View>
        <View style={[styles.card, { flex: 1, marginLeft: theme.spacing.xs }]}>
          <Text style={styles.sectionTitle}>Transport</Text>
          <Text style={styles.label}>Active Vehicles</Text>
          <Text style={styles.value}>{kpis?.transportKPIs?.activeVehicles ?? 0}</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activities.length > 0 ? (
          activities.map((act, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityText}>{act.description || act.title || 'Activity Log'}</Text>
              <Text style={styles.activityTime}>{act.time || act.date || ''}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activities</Text>
        )}
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md
  },
  sectionTitle: {
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
  },
  activityItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  activityText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.text
  },
  activityTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginTop: 4
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    fontStyle: 'italic'
  }
});
