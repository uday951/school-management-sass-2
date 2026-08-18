import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunicationScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' or 'notices'
  
  // Compose states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [annRes, noticeRes] = await Promise.all([
        principalApi.getAnnouncements(),
        principalApi.getNotices()
      ]);
      setAnnouncements(annRes.data?.data || []);
      setNotices(noticeRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation Error', 'Title and Content are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'announcements') {
        await principalApi.createAnnouncement({ title, content });
      } else {
        await principalApi.createNotice({ title, content });
      }
      Alert.alert('Success', `${activeTab === 'announcements' ? 'Announcement' : 'Notice'} published successfully.`);
      setTitle('');
      setContent('');
      fetchData(); // Refresh list instantly
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to publish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDate}>{new Date(item.createdAt || item.date).toLocaleDateString()}</Text>
      <Text style={styles.itemContent}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'announcements' && styles.activeTab]} 
            onPress={() => setActiveTab('announcements')}
          >
            <Text style={[styles.tabText, activeTab === 'announcements' && styles.activeTabText]}>Announcements</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'notices' && styles.activeTab]} 
            onPress={() => setActiveTab('notices')}
          >
            <Text style={[styles.tabText, activeTab === 'notices' && styles.activeTabText]}>Notices</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.composeDesk}>
          <Text style={styles.composeTitle}>Compose Desk</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Content"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={[styles.publishBtn, isSubmitting && styles.disabledBtn]} 
            onPress={handlePublish}
            disabled={isSubmitting}
          >
            <Text style={styles.publishBtnText}>{isSubmitting ? 'Publishing...' : 'Publish'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 'announcements' ? announcements : notices}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No items found.</Text>}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 16, color: '#666', fontWeight: '600' },
  activeTabText: { color: theme.colors.primary },
  composeDesk: { padding: 16, backgroundColor: '#fff', marginBottom: 8 },
  composeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  textArea: { height: 100 },
  publishBtn: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { opacity: 0.7 },
  publishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#888', marginBottom: 8 },
  itemContent: { fontSize: 14, color: '#555', lineHeight: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
