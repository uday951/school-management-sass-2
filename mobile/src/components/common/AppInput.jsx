import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../theme';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  containerStyle,
  inputStyle
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.light.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%'
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.xs
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.card
  },
  inputError: {
    borderColor: theme.colors.light.error
  },
  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.error,
    marginTop: 4
  }
});
