import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  const buttonStyle = [
    styles.button,
    isPrimary && styles.primaryBtn,
    isSecondary && styles.secondaryBtn,
    isDanger && styles.dangerBtn,
    (disabled || loading) && styles.disabled,
    style
  ];

  const labelStyle = [
    styles.text,
    isPrimary && styles.primaryText,
    isSecondary && styles.secondaryText,
    isDanger && styles.dangerText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? '#FFFFFF' : theme.colors.light.primary} size="small" />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg
  },
  primaryBtn: {
    backgroundColor: theme.colors.light.primary
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.light.primary
  },
  dangerBtn: {
    backgroundColor: theme.colors.light.error
  },
  disabled: {
    opacity: 0.6
  },
  text: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold
  },
  primaryText: {
    color: theme.colors.light.primaryForeground
  },
  secondaryText: {
    color: theme.colors.light.primary
  },
  dangerText: {
    color: '#FFFFFF'
  }
});
