import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AttendanceScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await principalApi.getAttendanceStats();
      setStats(res.data?.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.overviewPanel}>
          <Text style={styles.panelTitle}>Today's Overview</Text>
          <View style={styles.ratesContainer}>
            <View style={styles.rateBox}>
              <Text style={styles.rateValue}>{stats?.studentAttendancePct || 0}%</Text>
              <Text style={styles.rateLabel}>Student Rate</Text>
            </View>
            <View style={styles.rateBox}>
              <Text style={styles.rateValue}>{stats?.teacherAttendancePct || 0}%</Text>
              <Text style={styles.rateLabel}>Teacher Rate</Text>
            </View>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#e8f5e9' }]}>
              <Text style={styles.metricCount}>{stats?.presentCount || 0}</Text>
              <Text style={styles.metricLabel}>Present</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#ffebee' }]}>
              <Text style={styles.metricCount}>{stats?.absentCount || 0}</Text>
              <Text style={styles.metricLabel}>Absent</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#fff3e0' }]}>
              <Text style={styles.metricCount}>{stats?.lateCount || 0}</Text>
              <Text style={styles.metricLabel}>Late</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#e3f2fd' }]}>
              <Text style={styles.metricCount}>{stats?.halfdayCount || 0}</Text>
              <Text style={styles.metricLabel}>Halfday</Text>
            </View>
          </View>
        </View>

        {stats?.classes && stats.classes.length > 0 && (
          <View style={styles.classesSection}>
            <Text style={styles.sectionTitle}>Class by Class</Text>
            {stats.classes.map((cls, index) => (
              <View key={index} style={styles.classRow}>
                <Text style={styles.className}>{cls.className}</Text>
                <Text style={styles.classRate}>{cls.attendancePct}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContainer: { padding: 16 },
  overviewPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  ratesContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  rateBox: { alignItems: 'center' },
  rateValue: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  rateLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  metricCount: { fontSize: 20, fontWeight: 'bold' },
  metricLabel: { fontSize: 12, marginTop: 4, color: '#555' },
  classesSection: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  className: { fontSize: 14, color: '#333' },
  classRate: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary }
});
