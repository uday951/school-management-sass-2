import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import parentApi from '../../../services/api/parent.api';
import useChildStore from '../../../store/childStore';
import { theme } from '../../../theme';

export default function HomeScreen() {
  const { activeChild, children, setChildren, setActiveChild } = useChildStore();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadChildren = async () => {
      setLoading(true);
      try {
        const res = await parentApi.getChildren();
        const childData = res.data?.data || [];
        setChildren(childData);
        if (childData.length > 0 && !activeChild) {
          setActiveChild(childData[0]);
        }
      } catch (err) {
        console.error('Failed to load children:', err);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      if (!activeChild?._id && !activeChild?.id) return;
      const childId = activeChild._id || activeChild.id;
      try {
        const res = await parentApi.getChildSummary(childId);
        setSummary(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load child summary:', err);
      }
    };
    loadSummary();
  }, [activeChild]);

  return (
    <ScreenContainer title="Parent Dashboard" loading={loading}>
      <View style={styles.childSelector}>
        <Text style={styles.selectorLabel}>Selected Child:</Text>
        <FlatList
          horizontal
          data={children}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => {
            const isSelected = (activeChild?._id || activeChild?.id) === (item._id || item.id);
            return (
              <TouchableOpacity
                style={[styles.childBadge, isSelected && styles.childBadgeSelected]}
                onPress={() => setActiveChild(item)}
              >
                <Text style={[styles.childName, isSelected && styles.childNameSelected]}>
                  {item.firstName} {item.lastName}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.summaryContainer}>
        {activeChild ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{activeChild.firstName}'s Overview</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.statLabel}>Attendance Rate</Text>
                <Text style={styles.statValue}>{summary?.attendanceRate || 'N/A'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.statLabel}>Pending Homework</Text>
                <Text style={styles.statValue}>{summary?.pendingHomeworkCount ?? 'N/A'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.statLabel}>Recent Grade</Text>
                <Text style={styles.statValue}>{summary?.recentGrade || 'N/A'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.statLabel}>Fee Balance</Text>
                <Text style={styles.statValue}>{summary?.feeBalance ? `$${summary.feeBalance}` : 'N/A'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noChild}>
            <Text style={styles.noChildText}>No children linked to this parent account.</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  childSelector: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
    backgroundColor: theme.colors.light.card
  },
  selectorLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase'
  },
  childBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.light.background,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  childBadgeSelected: {
    backgroundColor: theme.colors.light.primary,
    borderColor: theme.colors.light.primary
  },
  childName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.text,
    fontWeight: theme.typography.weights.medium
  },
  childNameSelected: {
    color: theme.colors.light.primaryForeground
  },
  summaryContainer: {
    padding: theme.spacing.md,
    flex: 1
  },
  card: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.light.cardBorder,
    ...theme.shadows.md
  },
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -theme.spacing.xs
  },
  gridItem: {
    width: '50%',
    padding: theme.spacing.xs
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginBottom: 4
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  noChild: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noChildText: {
    color: theme.colors.light.textMuted,
    fontSize: theme.typography.sizes.md
  }
});
