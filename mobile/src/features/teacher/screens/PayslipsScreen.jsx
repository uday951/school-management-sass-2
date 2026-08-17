import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function PayslipsScreen() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayslips = async () => {
    try {
      const res = await teacherApi.getPayslips();
      setPayslips(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching teacher payslips:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayslips();
  }, []);

  return (
    <ScreenContainer title="Payslip & Payroll Folder" loading={loading}>
      <FlatList
        data={payslips}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
        ListEmptyComponent={<EmptyState title="No Payslips Found" message="No generated payroll records found in your folder." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.period}>{item.month || 'Salary'} {item.year || ''}</Text>
              <View style={[styles.badge, item.status === 'paid' ? styles.paid : styles.pending]}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'PAID'}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Net Salary Amount</Text>
              <Text style={styles.netValue}>${item.netSalary || item.netAmount || 0}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Gross: ${item.grossSalary || 0}</Text>
              <Text style={styles.detailLabel}>Deductions: ${item.deductionsAmount || item.deductions || 0}</Text>
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
  period: {
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
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  },
  netValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
    paddingTop: 6
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.light.textMuted
  }
});
