import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function ClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'students'

  const fetchData = async () => {
    try {
      const [classRes, studentRes] = await Promise.all([
        teacherApi.getClasses(),
        teacherApi.getStudents({ search })
      ]);
      setClasses(classRes.data?.data || []);
      setStudents(studentRes.data?.data?.data || studentRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching teacher classes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [search]);

  return (
    <ScreenContainer title="Classes & Classroom Roster" loading={loading}>
      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'classes' && styles.activeTab]}
          onPress={() => setActiveTab('classes')}
        >
          <Text style={[styles.tabText, activeTab === 'classes' && styles.activeTabText]}>
            Assigned Classes ({classes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
            Student Roster ({students.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'classes' ? (
        <FlatList
          data={classes}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
          ListEmptyComponent={<EmptyState title="No Assigned Classes" message="You currently have no class sections assigned in your profile." />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.className}>{item.className || 'Class Group'}</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>Section {item.section || 'A'}</Text>
                </View>
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.infoLabel}>Subject: <Text style={styles.infoVal}>{item.subjectName || item.subject || 'General'}</Text></Text>
                <Text style={styles.infoLabel}>Room: <Text style={styles.infoVal}>{item.roomNo || item.room || 'N/A'}</Text></Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search student by Name or Roll No..."
              placeholderTextColor={theme.colors.light.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={students}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
            ListEmptyComponent={<EmptyState title="No Students Found" message="No matching student records found for your assigned classes." />}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>
                    {item.firstName?.[0] || 'S'}{item.lastName?.[0] || ''}
                  </Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.studentMeta}>
                    Roll No: {item.rollNo || 'N/A'} • Adm No: {item.admissionNo || 'N/A'}
                  </Text>
                  <Text style={styles.studentClass}>
                    Class: {item.studentClass || item.class || 'N/A'}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.list}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: theme.colors.light.primary
  },
  tabText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.textMuted
  },
  activeTabText: {
    color: theme.colors.light.primary
  },
  searchContainer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  searchInput: {
    height: 38,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 6,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.background
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
    marginBottom: 8
  },
  className: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  sectionBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.light.primary + '15',
    borderRadius: 4
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  subInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
    paddingTop: 8
  },
  infoLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted
  },
  infoVal: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.light.border
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  avatarMiniText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.primary
  },
  studentDetails: {
    flex: 1
  },
  studentName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  studentMeta: {
    fontSize: 11,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  studentClass: {
    fontSize: 10,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 1
  }
});
