import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeesScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await principalApi.getFinanceStats();
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

  const billed = stats?.billedCollection || 0;
  const paid = stats?.paidAmount || 0;
  const pending = stats?.pendingDues || 0;
  const outstandingPct = stats?.outstandingPercentage || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.header}>Fees Overview</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Billed Collection</Text>
          <Text style={styles.cardValue}>${billed.toLocaleString()}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard, { borderLeftColor: theme.colors.success, borderLeftWidth: 4 }]}>
            <Text style={styles.cardLabel}>Paid Amount</Text>
            <Text style={[styles.cardValue, { color: theme.colors.success }]}>${paid.toLocaleString()}</Text>
          </View>
          <View style={[styles.card, styles.halfCard, { borderLeftColor: theme.colors.error, borderLeftWidth: 4 }]}>
            <Text style={styles.cardLabel}>Pending Dues</Text>
            <Text style={[styles.cardValue, { color: theme.colors.error }]}>${pending.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.meterCard}>
          <Text style={styles.cardLabel}>Outstanding Percentage</Text>
          <View style={styles.meterContainer}>
            <View style={[styles.meterFill, { width: `${outstandingPct}%`, backgroundColor: outstandingPct > 50 ? theme.colors.error : theme.colors.warning }]} />
          </View>
          <Text style={styles.meterText}>{outstandingPct}%</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContainer: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { width: '48%' },
  cardLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  meterCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  meterContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 12
  },
  meterFill: { height: '100%' },
  meterText: { fontSize: 18, fontWeight: 'bold', color: '#333' }
});
