import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import useChildStore from '../../../store/childStore';
import { theme } from '../../../theme';

export default function ResultsScreen() {
  const { activeChild } = useChildStore();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      const childId = activeChild?._id || activeChild?.id;
      if (!childId) return;
      setLoading(true);
      try {
        const res = await parentApi.getChildResults(childId);
        setResults(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [activeChild]);

  return (
    <ScreenContainer title="Academic Performance Results" loading={loading}>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Test Results" message="No exam or test results published for this child yet." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.examName}>{item.examName || 'Standard Assessment'}</Text>
              <Text style={styles.subject}>{item.subjectName || 'General'}</Text>
            </View>
            <View style={styles.marksRow}>
              <View>
                <Text style={styles.label}>Obtained</Text>
                <Text style={styles.score}>{item.marksObtained} / {item.maxMarks || 100}</Text>
              </View>
              <View style={styles.alignRight}>
                <Text style={styles.label}>Grade</Text>
                <Text style={[styles.score, styles.primaryText]}>{item.grade || 'N/A'}</Text>
              </View>
            </View>
            {item.remarks && <Text style={styles.remarks}>Remarks: {item.remarks}</Text>}
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
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  examName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  subject: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: 2
  },
  score: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  primaryText: {
    color: theme.colors.light.primary
  },
  alignRight: {
    alignItems: 'flex-end'
  },
  remarks: {
    fontSize: theme.typography.sizes.xs,
    fontStyle: 'italic',
    color: theme.colors.light.textMuted,
    backgroundColor: theme.colors.light.background,
    padding: 6,
    borderRadius: 4
  }
});
