import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function HomeworkScreen() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getHomework();
        setHomework(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, []);

  return (
    <ScreenContainer title="Homework Tasks Assigned" loading={loading}>
      <FlatList
        data={homework}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Assignments" message="You have not created any homework tasks for classrooms yet." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description || 'No description entered.'}</Text>
            <View style={styles.footer}>
              <Text style={styles.date}>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</Text>
              <Text style={styles.subCount}>Submissions: {item.submissionsCount || 0}</Text>
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
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 4
  },
  desc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.md
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
    paddingTop: theme.spacing.sm
  },
  date: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    fontWeight: theme.typography.weights.medium
  },
  subCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.semibold
  }
});
