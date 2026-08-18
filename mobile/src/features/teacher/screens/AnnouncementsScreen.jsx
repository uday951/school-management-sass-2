import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await teacherApi.getAnnouncements();
      setAnnouncements(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, []);

  return (
    <ScreenContainer title="Announcements & Circulars" loading={loading}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
        ListEmptyComponent={<EmptyState title="No Circulars" message="No institutional circulars published recently." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={[styles.priorityBadge, item.priority === 'high' ? styles.highPrio : styles.infoPrio]}>
                <Text style={styles.priorityText}>{item.priority?.toUpperCase() || 'INFO'}</Text>
              </View>
            </View>
            <Text style={styles.content}>{item.content || item.body || item.description || 'No detailed description content provided.'}</Text>
            <Text style={styles.date}>Published: {item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'Recent'}</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    flex: 1,
    marginRight: theme.spacing.sm
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  highPrio: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  infoPrio: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)'
  },
  priorityText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  content: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.sm
  },
  date: {
    fontSize: 11,
    color: theme.colors.light.textMuted
  }
});
