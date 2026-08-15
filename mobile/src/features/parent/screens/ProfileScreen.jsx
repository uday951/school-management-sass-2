import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import useAuthStore from '../../../store/authStore';
import authService from '../../../services/auth/auth.service';
import { theme } from '../../../theme';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <ScreenContainer title="Parent Profile">
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.name || 'Robert Daniel'}</Text>
          <Text style={styles.email}>{user?.email || '123@gmail.com'}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Associated Role</Text>
            <Text style={styles.value}>Parent Portal Access</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out from App</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    flex: 1
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 2
  },
  email: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.md
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.light.border,
    marginBottom: theme.spacing.md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  },
  value: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  logoutBtn: {
    height: 48,
    backgroundColor: theme.colors.light.error,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold
  }
});
