import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import { theme } from '../../../theme';

export default function AttendanceScreen() {
  const [selectedClass, setSelectedClass] = useState('Grade 10-A');
  
  const handleMarkAttendance = () => {
    Alert.alert('Roster Action', 'Classroom roster loaded in view mode. Marking registers requires web portal privileges.');
  };

  return (
    <ScreenContainer title="Mark Attendance">
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Selected Class Group</Text>
          <Text style={styles.value}>{selectedClass}</Text>
          <TouchableOpacity style={styles.btn} onPress={handleMarkAttendance}>
            <Text style={styles.btnText}>Load Class Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: 4
  },
  value: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md
  },
  btn: {
    height: 44,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold
  }
});
