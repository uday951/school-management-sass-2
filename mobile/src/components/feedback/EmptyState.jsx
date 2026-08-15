import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

export default function EmptyState({ message = 'No data available at this moment.', title = 'Nothing Found' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.xs
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    textAlign: 'center'
  }
});
