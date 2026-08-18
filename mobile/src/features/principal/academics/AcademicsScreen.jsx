import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AcademicsScreen() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        principalApi.getClasses(),
        principalApi.getSubjects()
      ]);
      setClasses(classesRes.data?.data || []);
      setSubjects(subjectsRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
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
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Academics Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{classes.length}</Text>
              <Text style={styles.statLabel}>Active Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{subjects.length}</Text>
              <Text style={styles.statLabel}>Total Subjects</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class Directories</Text>
          {classes.map((cls, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{cls.name || cls.className}</Text>
              <Text style={styles.itemDetail}>{cls.section || 'N/A'}</Text>
            </View>
          ))}
          {classes.length === 0 && <Text style={styles.emptyText}>No classes available</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Directories</Text>
          {subjects.map((sub, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{sub.name || sub.subjectName}</Text>
              <Text style={styles.itemDetail}>{sub.code || sub.designation}</Text>
            </View>
          ))}
          {subjects.length === 0 && <Text style={styles.emptyText}>No subjects available</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContainer: { padding: 16 },
  summaryCard: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 14, color: '#e0e0e0', marginTop: 4 },
  section: {
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemName: { fontSize: 14, color: '#333', fontWeight: '500' },
  itemDetail: { fontSize: 14, color: '#666' },
  emptyText: { color: '#999', fontStyle: 'italic', paddingVertical: 8 }
});
