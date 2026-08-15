import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import authService from '../../../services/auth/auth.service';
import { theme } from '../../../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMockRole, setSelectedMockRole] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email, password);
    } catch (error) {
      Alert.alert('Authentication Failed', error.message || 'Unable to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (role) => {
    setSelectedMockRole(role);
    setLoading(true);
    try {
      await authService.loginMock(role);
    } catch (error) {
      Alert.alert('Mock Login Failed', 'Unable to execute developer session bypass.');
    } finally {
      setLoading(false);
      setSelectedMockRole(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerSection}>
            <Text style={styles.appName}>{process.env.EXPO_PUBLIC_APP_NAME || 'School ERP'}</Text>
            <Text style={styles.tagline}>Enterprise Mobile Companion Portal</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. parent@school.edu"
              placeholderTextColor={theme.colors.light.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter account security key"
              placeholderTextColor={theme.colors.light.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading && !selectedMockRole ? (
                <ActivityIndicator color={theme.colors.light.primaryForeground} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In to Workspace</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Developer Mock Portals</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.mockActionsContainer}>
            <TouchableOpacity 
              style={[styles.mockBtn, styles.adminMockBg, loading && styles.buttonDisabled]} 
              onPress={() => handleMockLogin('school_admin')}
              disabled={loading}
            >
              {loading && selectedMockRole === 'school_admin' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.mockBtnText}>Principal Workspace</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mockBtn, styles.teacherMockBg, loading && styles.buttonDisabled]} 
              onPress={() => handleMockLogin('teacher')}
              disabled={loading}
            >
              {loading && selectedMockRole === 'teacher' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.mockBtnText}>Teacher Workspace</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mockBtn, styles.parentMockBg, loading && styles.buttonDisabled]} 
              onPress={() => handleMockLogin('parent')}
              disabled={loading}
            >
              {loading && selectedMockRole === 'parent' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.mockBtnText}>Parent Workspace</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    flexGrow: 1
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl
  },
  appName: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary,
    marginBottom: theme.spacing.xs
  },
  tagline: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  },
  formContainer: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.light.cardBorder,
    ...theme.shadows.md
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
    backgroundColor: theme.colors.light.background,
    marginBottom: theme.spacing.md
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg
  },
  forgotText: {
    color: theme.colors.light.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium
  },
  primaryButton: {
    height: 48,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm
  },
  primaryButtonText: {
    color: theme.colors.light.primaryForeground,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold
  },
  buttonDisabled: {
    opacity: 0.6
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.light.border
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.light.textMuted,
    fontSize: theme.typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  mockActionsContainer: {
    spaceY: theme.spacing.sm
  },
  mockBtn: {
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm
  },
  adminMockBg: {
    backgroundColor: theme.colors.light.primary
  },
  teacherMockBg: {
    backgroundColor: theme.colors.light.secondary
  },
  parentMockBg: {
    backgroundColor: '#64748B' // Gray slate
  },
  mockBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold
  }
});
