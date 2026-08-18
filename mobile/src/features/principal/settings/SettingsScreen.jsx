import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import ScreenContainer from "../../../components/layout/ScreenContainer";
import useAuthStore from "../../../store/authStore";
import authService from "../../../services/auth/auth.service";
import { theme } from "../../../theme";

export default function SettingsScreen() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <ScreenContainer title="Settings & Profile" scrollable>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Principal Profile Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || "Principal Account"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || "admin@school.edu"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Access Role</Text>
          <Text style={styles.value}>Principal (school_admin)</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out from ERP Mobile</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
    paddingBottom: theme.spacing.sm
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold
  }
});
