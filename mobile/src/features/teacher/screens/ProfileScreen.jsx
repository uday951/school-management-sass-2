import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import teacherApi from '../../../services/api/teacher.api';
import authService from '../../../services/auth/auth.service';
import useAuthStore from '../../../store/authStore';
import { theme } from '../../../theme';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await teacherApi.getProfile();
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  const name = profile ? `${profile.firstName} ${profile.lastName}` : (user?.name || 'Faculty Member');
  const email = profile?.email || user?.email || 'N/A';
  const employeeId = profile?.employeeId || 'N/A';
  const department = profile?.department || 'Faculty';
  const designation = profile?.designation || 'Teacher';
  const phone = profile?.phone || 'N/A';
  const qualification = profile?.qualification || 'N/A';

  return (
    <ScreenContainer title="My Teacher Profile" loading={loading}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.headerDetails}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.designation}>{designation}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{employeeId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Department</Text>
            <Text style={styles.value}>{department}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone Contact</Text>
            <Text style={styles.value}>{phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Qualification</Text>
            <Text style={styles.value}>{qualification}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out from Mobile App</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  avatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.light.primary + '15',
    borderWidth: 1.5,
    borderColor: theme.colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  avatarText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  headerDetails: {
    flex: 1
  },
  name: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  designation: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.primary,
    marginTop: 2
  },
  email: {
    fontSize: 11,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.light.border,
    marginBottom: theme.spacing.md
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  },
  value: {
    fontSize: theme.typography.sizes.xs,
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
