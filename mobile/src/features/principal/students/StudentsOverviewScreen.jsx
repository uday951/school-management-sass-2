import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentsOverviewScreen() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = async (currentPage, searchQuery, isRefresh = false) => {
    try {
      if (!isRefresh && currentPage === 1) setLoading(true);
      const res = await principalApi.getStudents({ page: currentPage, search: searchQuery });
      const newStudents = res.data?.data || [];
      
      setStudents(prev => isRefresh || currentPage === 1 ? newStudents : [...prev, ...newStudents]);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchStudents(1, search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchStudents(1, search, true);
  }, [search]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStudents(nextPage, search);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'active' ? theme.colors.success : theme.colors.error }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.detail}>Admission No: {item.admissionNo}</Text>
      <Text style={styles.detail}>Class: {item.class || item.studentClass}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search students..."
        value={search}
        onChangeText={setSearch}
      />
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No students found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
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
  name: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  detail: { fontSize: 14, color: '#555', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
