import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import principalApi from '../../../services/api/principal.api';
import { theme } from '../../../theme';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await principalApi.getAnnouncements();
      setAnnouncements(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async () => {
    if (!title || !content) {
      Alert.alert('Required Info', 'Please enter a title and description.');
      return;
    }
    try {
      await principalApi.createAnnouncement({ title, content, type: 'general' });
      setTitle('');
      setContent('');
      Alert.alert('Success', 'Announcement published.');
      fetchAnnouncements();
    } catch (err) {
      Alert.alert('Error', 'Unable to publish announcement.');
    }
  };

  return (
    <ScreenContainer title="Post Announcement" loading={loading} scrollable>
      <View style={styles.form}>
        <Text style={styles.formTitle}>New Announcement</Text>
        <TextInput
          style={styles.input}
          placeholder="Announcement Title"
          placeholderTextColor={theme.colors.light.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Details content..."
          placeholderTextColor={theme.colors.light.textMuted}
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity style={styles.btn} onPress={handlePostAnnouncement}>
          <Text style={styles.btnText}>Publish Announcement</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Circulars List</Text>
      <FlatList
        scrollEnabled={false}
        data={announcements}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Circulars" message="No announcements created in the history tracker." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent}>{item.content || item.body}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  formTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 6,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.background
  },
  btn: {
    height: 40,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4
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
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 4
  },
  cardContent: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  }
});
