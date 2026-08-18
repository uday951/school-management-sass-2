import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinanceScreen() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'income'

  const fetchData = async () => {
    try {
      const [expensesRes, incomeRes] = await Promise.all([
        principalApi.getExpenses(),
        principalApi.getIncome()
      ]);
      setExpenses(expensesRes.data?.data || []);
      setIncome(incomeRes.data?.data || []);
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

  const renderItem = ({ item }) => {
    const isIncome = activeTab === 'income';
    const amountColor = isIncome ? theme.colors.success : theme.colors.error;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.refNo}>{item.referenceNo || item.id || 'N/A'}</Text>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}${item.amount}
          </Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.paymentMethod}>{item.paymentMethod || item.method}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'expenses' && styles.activeTab]} 
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'income' && styles.activeTab]} 
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>Income Stream</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'expenses' ? expenses : income}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  tabsContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 16, color: '#666', fontWeight: '600' },
  activeTabText: { color: theme.colors.primary },
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
  refNo: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  amount: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 15, color: '#333', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { fontSize: 12, color: '#888', backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  paymentMethod: { fontSize: 12, color: '#888' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
