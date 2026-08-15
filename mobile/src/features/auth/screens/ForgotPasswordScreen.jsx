import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleResetRequest = () => {
    if (!email) {
      Alert.alert('Required Info', 'Please enter your account email.');
      return;
    }
    // Simulation / Placeholder for now since this matches web stub behavior
    Alert.alert(
      'Recovery Email Sent',
      'If an account exists, you will receive password reset instructions.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your institutional email address to retrieve recovery instructions.</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. parent@school.edu"
          placeholderTextColor={theme.colors.light.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.btn} onPress={handleResetRequest}>
          <Text style={styles.btnText}>Request Verification Link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
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
