import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppCard from './AppCard';
import { theme } from '../../theme';

export default function StatCard({ label, value, style }) {
  return (
    <AppCard style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  value: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  }
});
