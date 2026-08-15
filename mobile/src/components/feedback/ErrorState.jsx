import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';

export default function ErrorState({ errorMsg = 'An error occurred while loading content.', onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Occurred</Text>
      <Text style={styles.message}>{errorMsg}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.error,
    marginBottom: theme.spacing.xs
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  btn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6
  },
  btnText: {
    color: theme.colors.light.primaryForeground,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold
  }
});
