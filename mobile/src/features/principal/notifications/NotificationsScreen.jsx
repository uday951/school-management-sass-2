import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await principalApi.getNotifications();
      setNotifications(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const toggleReadStatus = async (id) => {
    try {
      await principalApi.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id === id || notif.id === id) ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    const isRead = item.isRead;
    const id = item._id || item.id;

    return (
      <TouchableOpacity 
        style={[styles.card, !isRead && styles.unreadCard]} 
        onPress={() => toggleReadStatus(id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.icon || 'notifications-outline'} 
            size={24} 
            color={!isRead ? theme.colors.primary : '#888'} 
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !isRead && styles.unreadText]}>{item.title}</Text>
            <Text style={styles.time}>{item.time || new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        </View>
        {!isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications right now.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  listContainer: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center'
  },
  unreadCard: { backgroundColor: '#f5f9ff', borderColor: theme.colors.primary, borderWidth: 1 },
  iconContainer: { marginRight: 16 },
  contentContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: '#555', flex: 1 },
  unreadText: { color: '#000', fontWeight: 'bold' },
  time: { fontSize: 12, color: '#999', marginLeft: 8 },
  message: { fontSize: 14, color: '#666', lineHeight: 20 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary, marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#888' }
});
