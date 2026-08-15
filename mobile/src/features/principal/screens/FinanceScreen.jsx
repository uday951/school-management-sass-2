import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function FinanceScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinance = async () => {
      setLoading(true);
      try {
        const res = await principalApi.getFinanceStats();
        setStats(res.data?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  return (
    <ScreenContainer title="Finance Dashboard" loading={loading} scrollable>
      <View style={styles.card}>
        <Text style={styles.title}>Collections & Invoices Balance</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Today's Fee Collection</Text>
          <Text style={styles.value}>${stats?.todayCollection || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Monthly Fee Collection</Text>
          <Text style={styles.value}>${stats?.monthlyCollection || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Outstanding Invoices</Text>
          <Text style={[styles.value, styles.warningText]}>${stats?.outstandingFees || 0}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  },
  value: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  warningText: {
    color: theme.colors.light.accent
  }
});
