import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function HomeScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await teacherApi.getDashboard();
      if (res.data?.success && res.data.data) {
        setDashboard(res.data.data);
      } else {
        setDashboard(null);
      }
    } catch (err) {
      console.error('Error fetching teacher dashboard:', err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  const profile = dashboard?.teacherProfile || {};
  const announcements = dashboard?.announcements || [];
  const schedule = dashboard?.todaysSchedule || [];

  return (
    <ScreenContainer title="Teacher Dashboard" loading={loading}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
      >
        {/* Profile Welcome Banner */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.name ? profile.name.split(' ').map((n) => n[0]).join('') : 'TC'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name || 'Faculty Member'}</Text>
            <Text style={styles.profileMeta}>{profile.designation || 'Teacher'} • {profile.department || 'Faculty'}</Text>
            <Text style={styles.profileSubMeta}>ID: {profile.employeeId || 'N/A'} • {profile.email || ''}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Overview Stat Cards */}
        <Text style={styles.sectionHeader}>Workspace Overview</Text>
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Text style={styles.statLabel}>Assigned Classes</Text>
            <Text style={styles.statValue}>{dashboard?.assignedClassesCount || 0}</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.statLabel}>Total Students</Text>
            <Text style={styles.statValue}>{dashboard?.totalStudentCount || 0}</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.statLabel}>Pending Homework</Text>
            <Text style={styles.statValue}>{dashboard?.pendingHomeworkCount || 0}</Text>
          </View>
          <View style={styles.gridCard}>
            <Text style={styles.statLabel}>Upcoming Exams</Text>
            <Text style={styles.statValue}>{dashboard?.upcomingExamsCount || 0}</Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeader}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.('Classes')}>
            <Text style={styles.linkText}>View All Classes →</Text>
          </TouchableOpacity>
        </View>

        {schedule.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No scheduled periods configured for today.</Text>
          </View>
        ) : (
          schedule.map((item, idx) => (
            <View key={item.id || idx.toString()} style={styles.scheduleCard}>
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{item.period || `P${idx + 1}`}</Text>
              </View>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleTitle}>{item.subject} ({item.className}-{item.section})</Text>
                <Text style={styles.scheduleTime}>Time: {item.time} • Room: {item.room || 'N/A'}</Text>
              </View>
            </View>
          ))
        )}

        {/* Recent Announcements */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeader}>Announcements</Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.('Announcements')}>
            <Text style={styles.linkText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {announcements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent institutional circulars published.</Text>
          </View>
        ) : (
          announcements.map((a) => (
            <View key={a.id || a._id} style={styles.announcementCard}>
              <Text style={styles.annTitle}>{a.title}</Text>
              <Text style={styles.annDate}>{a.date || 'Recent'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.md
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.light.primary + '15',
    borderWidth: 1.5,
    borderColor: theme.colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  avatarText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  profileMeta: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.primary,
    marginTop: 2
  },
  profileSubMeta: {
    fontSize: 11,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  errorCard: {
    backgroundColor: theme.colors.light.error + '10',
    borderColor: theme.colors.light.error,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md
  },
  errorText: {
    color: theme.colors.light.error,
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center'
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs
  },
  sectionHeader: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginVertical: theme.spacing.xs
  },
  linkText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    margin: '1%',
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.light.textMuted,
    marginBottom: 4,
    fontWeight: theme.typography.weights.medium
  },
  statValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.light.primary + '15',
    borderRadius: 4,
    marginRight: theme.spacing.sm
  },
  periodText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  scheduleDetails: {
    flex: 1
  },
  scheduleTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  scheduleTime: {
    fontSize: 11,
    color: theme.colors.light.textMuted
  },
  announcementCard: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  annTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  annDate: {
    fontSize: 10,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  emptyCard: {
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  emptyText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  }
});
