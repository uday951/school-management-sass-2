import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function ExamsScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getExams();
        setExams(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <ScreenContainer title="Exams Schedule" loading={loading}>
      <FlatList
        data={exams}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Exam Schedules" message="There are no active exam periods configured in your portal." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name || item.title || 'Standard Exam'}</Text>
            <View style={styles.footer}>
              <Text style={styles.date}>Starts: {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'ACTIVE'}</Text>
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
    marginBottom: theme.spacing.md
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  date: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 4
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  }
});
