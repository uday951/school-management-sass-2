import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function StudentsOverviewScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await principalApi.getStudentStats();
        setData(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <ScreenContainer title="Students Directory Overview" loading={loading}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        ListEmptyComponent={<EmptyState title="No Records" message="No registered student logs available." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.subInfo}>Class: {item.studentClass || 'N/A'}</Text>
              <Text style={styles.subInfo}>Admission No: {item.admissionNo || 'N/A'}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  name: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 4
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  subInfo: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  }
});
