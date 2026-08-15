import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme';

export default function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.cardBorder,
    ...theme.shadows.sm
  }
});
