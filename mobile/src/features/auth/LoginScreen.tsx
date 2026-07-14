import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AppScreen, AppInput, AppButton, themeColors } from '../../components/ui';
import { Eye as EyeRaw, EyeOff as EyeOffRaw, Lock as LockRaw, ShieldCheck as ShieldCheckRaw } from 'lucide-react-native';

const Eye = EyeRaw as any;
const EyeOff = EyeOffRaw as any;
const Lock = LockRaw as any;
const ShieldCheck = ShieldCheckRaw as any;

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill in all credentials fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen scrollable>
      <View style={styles.container}>
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <ShieldCheck size={40} color={themeColors.primary} />
          </View>
          <Text style={styles.title}>SchoolSaaS</Text>
          <Text style={styles.subtitle}>School Management Platform</Text>
          <Text style={styles.subtitleSub}>Secure · Private · Professional</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In to Your Account</Text>

          <AppInput
            label="Email Address"
            placeholder="e.g. name@school.com"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password field with toggle */}
          <View style={styles.passwordWrapper}>
            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(prev => !prev)}
              activeOpacity={0.7}
            >
              {showPassword
                ? <EyeOff size={18} color={themeColors.textMuted} />
                : <Eye size={18} color={themeColors.textMuted} />
              }
            </TouchableOpacity>
          </View>

          <View style={styles.showPasswordRow}>
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.showPasswordBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? '🙈  Hide Password' : '👁  Show Password'}
              </Text>
            </TouchableOpacity>
          </View>

          <AppButton title="Sign In" onPress={handleLogin} loading={loading} />
        </View>

        {/* Credential Hint */}
        <View style={styles.hintBox}>
          <Lock size={13} color={themeColors.textMuted} />
          <Text style={styles.hintText}>
            Your credentials are encrypted and never stored on device
          </Text>
        </View>

        <Text style={styles.footerText}>
          Production Environment • Tenant Isolated Protection
        </Text>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: themeColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: themeColors.text,
    marginTop: 4,
    fontWeight: '600',
  },
  subtitleSub: {
    fontSize: 12,
    color: themeColors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: themeColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    bottom: 26,
    padding: 4,
    zIndex: 10,
  },
  showPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  showPasswordBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  showPasswordText: {
    fontSize: 12,
    color: themeColors.primary,
    fontWeight: '600',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  hintText: {
    fontSize: 11,
    color: themeColors.textMuted,
    textAlign: 'center',
    flex: 1,
  },
  footerText: {
    textAlign: 'center',
    color: themeColors.textMuted,
    fontSize: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
