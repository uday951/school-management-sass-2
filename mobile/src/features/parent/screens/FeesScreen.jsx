import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import { theme } from '../../../theme';

export default function FeesScreen() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      try {
        const res = await parentApi.getFees();
        setFees(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  return (
    <ScreenContainer title="Fee Structure & Bills" loading={loading}>
      <FlatList
        data={fees}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Bills Registered" message="There are no active invoices found for your account." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{item.title || 'Tuition Fee Bill'}</Text>
              <View style={[styles.badge, item.status === 'paid' ? styles.paid : styles.pending]}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'PENDING'}</Text>
              </View>
            </View>
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Text style={styles.label}>Total Amount</Text>
                <Text style={styles.value}>${item.amount || item.totalFee || 0}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.label}>Paid</Text>
                <Text style={[styles.value, styles.successText]}>${item.paidAmount || 0}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.label}>Balance</Text>
                <Text style={[styles.value, styles.warningText]}>${item.balanceAmount ?? item.amount ?? 0}</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4
  },
  paid: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  pending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailItem: {
    flex: 1,
    alignItems: 'center'
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: 4
  },
  value: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  successText: {
    color: theme.colors.light.secondary
  },
  warningText: {
    color: theme.colors.light.accent
  }
});
