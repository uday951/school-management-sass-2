import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function HomeworkScreen() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHomework = async () => {
    try {
      const res = await teacherApi.getHomework();
      setHomework(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching homework:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomework();
  }, []);

  const handleCreateHomework = async () => {
    if (!title || !dueDate) {
      Alert.alert('Required Info', 'Please enter Title and Due Date.');
      return;
    }
    setSubmitting(true);
    try {
      await teacherApi.createHomework({
        title,
        description,
        dueDate
      });
      Alert.alert('Success', 'Homework task published successfully.');
      setTitle('');
      setDescription('');
      setDueDate('');
      setShowCreate(false);
      fetchHomework();
    } catch (err) {
      Alert.alert('Error', 'Unable to publish homework task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHomework = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this homework task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await teacherApi.deleteHomework(id);
            fetchHomework();
          } catch (err) {
            Alert.alert('Error', 'Could not delete homework.');
          }
        }
      }
    ]);
  };

  return (
    <ScreenContainer title="Homework & Assignments" loading={loading}>
      {/* Header Actions */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Assigned Tasks ({homework.length})</Text>
        <TouchableOpacity style={styles.createToggleBtn} onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.createToggleText}>{showCreate ? '✕ Cancel' : '+ Create Homework'}</Text>
        </TouchableOpacity>
      </View>

      {/* Create Homework Collapsible Form */}
      {showCreate ? (
        <View style={styles.createForm}>
          <Text style={styles.formHeading}>Publish New Homework</Text>
          <TextInput
            style={styles.input}
            placeholder="Assignment Title (e.g. Chapter 4 Exercises)"
            placeholderTextColor={theme.colors.light.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Due Date (YYYY-MM-DD)"
            placeholderTextColor={theme.colors.light.textMuted}
            value={dueDate}
            onChangeText={setDueDate}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Detailed instructions or reading references..."
            placeholderTextColor={theme.colors.light.textMuted}
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity
            style={[styles.publishBtn, submitting && styles.btnDisabled]}
            disabled={submitting}
            onPress={handleCreateHomework}
          >
            <Text style={styles.publishBtnText}>
              {submitting ? 'Publishing...' : 'Publish Assignment'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Homework List */}
      <FlatList
        data={homework}
        keyExtractor={(item) => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
        ListEmptyComponent={<EmptyState title="No Assignments" message="You have not created any homework tasks for classrooms yet." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <TouchableOpacity onPress={() => handleDeleteHomework(item._id || item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.desc}>{item.description || 'No detailed instructions provided.'}</Text>
            <View style={styles.footer}>
              <Text style={styles.date}>Due Date: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</Text>
              <Text style={styles.subCount}>Submissions: {item.submissionsCount || 0}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  headerTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  createToggleBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6
  },
  createToggleText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold
  },
  createForm: {
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  formHeading: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm
  },
  input: {
    height: 38,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 6,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.background
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    paddingVertical: theme.spacing.xs
  },
  publishBtn: {
    height: 38,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  btnDisabled: {
    opacity: 0.6
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold
  },
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
    marginBottom: 4
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    flex: 1,
    marginRight: theme.spacing.sm
  },
  deleteText: {
    fontSize: 11,
    color: theme.colors.light.error,
    fontWeight: theme.typography.weights.bold
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
  subCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.semibold
  }
});
