import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';

export default function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Required Info', 'Please enter your new password in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    Alert.alert(
      'Password Updated',
      'Your credentials have been successfully updated.',
      [{ text: 'Proceed', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Create a new strong password for your workspace.</Text>

        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor={theme.colors.light.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor={theme.colors.light.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.btn} onPress={handleResetPassword}>
          <Text style={styles.btnText}>Apply Password Change</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>Return to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center'
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.xl
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.card,
    marginBottom: theme.spacing.lg
  },
  btn: {
    height: 48,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md
  },
  btnText: {
    color: theme.colors.light.primaryForeground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm
  },
  backText: {
    color: theme.colors.light.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium
  }
});
