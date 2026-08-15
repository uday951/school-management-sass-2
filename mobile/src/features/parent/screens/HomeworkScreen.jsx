import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import useChildStore from '../../../store/childStore';
import { theme } from '../../../theme';

export default function HomeworkScreen() {
  const { activeChild } = useChildStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHomework = async () => {
      const childId = activeChild?._id || activeChild?.id;
      if (!childId) return;
      setLoading(true);
      try {
        const res = await parentApi.getChildHomework(childId);
        setRecords(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, [activeChild]);

  return (
    <ScreenContainer title="Homework & Assignments" loading={loading}>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Homework Assigned" message="There are no active homework assignments for this child." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description || 'No description provided.'}</Text>
            <View style={styles.footer}>
              <Text style={styles.date}>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</Text>
              <View style={[styles.badge, item.isSubmitted ? styles.submitted : styles.pending]}>
                <Text style={styles.badgeText}>{item.isSubmitted ? 'SUBMITTED' : 'PENDING'}</Text>
              </View>
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
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4
  },
  submitted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  pending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  }
});
