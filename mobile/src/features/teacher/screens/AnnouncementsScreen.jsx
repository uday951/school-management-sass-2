import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getAnnouncements();
        setAnnouncements(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <ScreenContainer title="Announcements" loading={loading}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Circulars" message="No institutional circulars published recently." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content || item.body || 'No description content provided.'}</Text>
            <Text style={styles.date}>{item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'N/A'}</Text>
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
    marginBottom: 6
  },
  content: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted,
    marginBottom: theme.spacing.sm
  },
  date: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  }
});
