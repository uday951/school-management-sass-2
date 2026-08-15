import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function TeachersOverviewScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await principalApi.getKPIs();
        setData(res.data?.data?.recentActivity?.teachers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <ScreenContainer title="Teachers Directory Overview" loading={loading}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        ListEmptyComponent={<EmptyState title="No Records" message="No teacher logs found in current workspace." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.firstName || item.name} {item.lastName || ''}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.subInfo}>Dept: {item.department || 'General'}</Text>
              <Text style={styles.subInfo}>Designation: {item.designation || 'Staff'}</Text>
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
