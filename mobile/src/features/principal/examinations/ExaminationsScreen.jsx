import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExaminationsScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExams = async () => {
    try {
      const [examsRes, schedulesRes] = await Promise.all([
        principalApi.getExams(),
        principalApi.getExamSchedules()
      ]);
      
      const combined = [
        ...(examsRes.data?.data || []),
        ...(schedulesRes.data?.data || [])
      ];
      setExams(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExams();
  }, []);

  const renderItem = ({ item }) => {
    const startDate = new Date(item.startDate || item.date).toLocaleDateString();
    const endDate = item.endDate ? new Date(item.endDate).toLocaleDateString() : '';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.name || item.examName || 'Examination'}</Text>
          <View style={[styles.badge, { backgroundColor: item.status === 'upcoming' ? theme.colors.primary : theme.colors.success }]}>
            <Text style={styles.badgeText}>{item.status || 'Scheduled'}</Text>
          </View>
        </View>
        <Text style={styles.detail}>Start: {startDate}</Text>
        {endDate ? <Text style={styles.detail}>End: {endDate}</Text> : null}
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={exams}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No examinations scheduled.</Text>}
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
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  detail: { fontSize: 14, color: '#555', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
