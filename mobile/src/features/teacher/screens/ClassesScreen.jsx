import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function ClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getClasses();
        setClasses(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <ScreenContainer title="My Assigned Classes" loading={loading}>
      <FlatList
        data={classes}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        ListEmptyComponent={<EmptyState title="No Classes" message="You have no assigned classroom schedules configured." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.className}>{item.className || 'Class Group'}</Text>
            <View style={styles.subInfo}>
              <Text style={styles.infoLabel}>Subject: {item.subjectName || 'General Academic'}</Text>
              <Text style={styles.infoLabel}>Room: {item.roomNo || 'N/A'}</Text>
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
  className: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 6
  },
  subInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  }
});
