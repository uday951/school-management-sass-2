import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import useChildStore from '../../../store/childStore';
import { theme } from '../../../theme';

export default function TimetableScreen() {
  const { activeChild } = useChildStore();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      const childId = activeChild?._id || activeChild?.id;
      if (!childId) return;
      setLoading(true);
      try {
        const res = await parentApi.getChildTimetable(childId);
        setTimetable(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [activeChild]);

  return (
    <ScreenContainer title="Weekly Schedule" loading={loading}>
      <FlatList
        data={timetable}
        keyExtractor={(item) => item._id || item.id}
        ListEmptyComponent={<EmptyState title="No Schedule Configured" message="There is no active schedule registered for this child's class." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.timeCol}>
              <Text style={styles.time}>{item.startTime || '09:00'} - {item.endTime || '10:00'}</Text>
              <Text style={styles.day}>{item.day || 'Monday'}</Text>
            </View>
            <View style={styles.subjectCol}>
              <Text style={styles.subject}>{item.subjectName || 'General Science'}</Text>
              <Text style={styles.teacher}>Room {item.roomNo || '101'} • {item.teacherName || 'Staff'}</Text>
            </View>
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
    flexDirection: 'row',
    backgroundColor: theme.colors.light.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  timeCol: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: theme.colors.light.border,
    paddingRight: theme.spacing.sm,
    justifyContent: 'center'
  },
  time: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.primary
  },
  day: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginTop: 2
  },
  subjectCol: {
    flex: 3,
    paddingLeft: theme.spacing.md,
    justifyContent: 'center'
  },
  subject: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  teacher: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginTop: 2
  }
});
