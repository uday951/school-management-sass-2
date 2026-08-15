import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import useNotificationStore from '../../../store/notificationStore';
import { theme } from '../../../theme';

export default function NotificationsScreen() {
  const { notifications, setNotifications, decrementUnread } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await parentApi.getNotifications();
        setNotifications(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (item) => {
    if (item.readStatus || item.isRead) return;
    const id = item._id || item.id;
    try {
      await parentApi.markNotificationRead(id);
      const updated = notifications.map((n) =>
        (n._id || n.id) === id ? { ...n, readStatus: true, isRead: true } : n
      );
      setNotifications(updated);
      decrementUnread();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScreenContainer title="Alerts & Notifications" loading={loading}>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        ListEmptyComponent={<EmptyState title="Inbox Empty" message="No alerts received in your inbox recently." />}
        renderItem={({ item }) => {
          const isRead = item.readStatus || item.isRead;
          return (
            <TouchableOpacity
              style={[styles.card, !isRead && styles.unreadCard]}
              onPress={() => handleMarkAsRead(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.title, !isRead && styles.unreadTitle]}>{item.title}</Text>
                {!isRead && <View style={styles.badge} />}
              </View>
              <Text style={styles.body}>{item.body || item.message || 'Alert notification details'}</Text>
            </TouchableOpacity>
          );
        }}
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
  unreadCard: {
    borderColor: theme.colors.light.primary,
    backgroundColor: 'rgba(79, 70, 229, 0.02)'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  unreadTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.light.primary
  },
  body: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.textMuted
  }
});
