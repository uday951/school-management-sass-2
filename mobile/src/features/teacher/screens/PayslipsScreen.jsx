import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function PayslipsScreen() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayslips = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getPayslips();
        setPayslips(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  return (
    <ScreenContainer title="Payslip history" loading={loading}>
      <FlatList
        data={payslips}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Payslips" message="No generated payroll records found in your folder." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.period}>{item.month} {item.year}</Text>
              <View style={[styles.badge, item.status === 'paid' ? styles.paid : styles.pending]}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'PAID'}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Net Salary Amount</Text>
              <Text style={styles.value}>${item.netSalary || item.netAmount || 0}</Text>
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
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  },
  value: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  }
});
