import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { AppScreen, LoadingState, EmptyState, MetricCard, AppButton, AppBadge, themeColors } from '../../components/ui';
import { useIsFocused } from '@react-navigation/native';
import {
  BookOpen as BookOpenRaw,
  CheckSquare as CheckSquareRaw,
  Calendar as CalendarRaw,
  User as UserRaw,
  Plus as PlusRaw,
  ChevronRight as ChevronRightRaw,
  ClipboardList as ClipboardListRaw,
  LogOut as LogOutRaw,
  ArrowLeft as ArrowLeftRaw,
  Check as CheckRaw,
  X as XRaw,
  Search as SearchRaw,
  AlertCircle as AlertCircleRaw,
  Lock as LockRaw,
  Edit2 as Edit2Raw,
  Trash2 as Trash2Raw,
  FileText as FileTextRaw,
} from 'lucide-react-native';

const BookOpen = BookOpenRaw as any;
const CheckSquare = CheckSquareRaw as any;
const Calendar = CalendarRaw as any;
const User = UserRaw as any;
const Plus = PlusRaw as any;
const ChevronRight = ChevronRightRaw as any;
const ClipboardList = ClipboardListRaw as any;
const LogOut = LogOutRaw as any;
const ArrowLeft = ArrowLeftRaw as any;
const Check = CheckRaw as any;
const X = XRaw as any;
const Search = SearchRaw as any;
const AlertCircle = AlertCircleRaw as any;
const Lock = LockRaw as any;
const Edit2 = Edit2Raw as any;
const Trash2 = Trash2Raw as any;
const FileText = FileTextRaw as any;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ---------------------------------------------------------------------------
// TEACHER HOME SCREEN
// ---------------------------------------------------------------------------
function TeacherHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ classesTodayCount: 0, attendancePendingCount: 0, schedule: [], leaveRequests: [] });

  const fetchHomeData = async () => {
    try {
      const res = await apiClient.get('/mobile/teacher/home');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch teacher home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchHomeData();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      {/* Executive Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerGreeting}>Good morning,</Text>
          <Text style={styles.headerName}>{user?.firstName || 'Teacher'} {user?.lastName || ''}</Text>
          <Text style={styles.headerRole}>Mathematics Lead Faculty</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={themeColors.danger} />
        </TouchableOpacity>
      </View>

      {/* Operational Status Panel */}
      <View style={styles.metricGrid}>
        <MetricCard title="Today's Classes" value={data.classesTodayCount || 0} />
        <MetricCard
          title="Pending Attendance"
          value={data.attendancePendingCount || 0}
          variant={data.attendancePendingCount > 0 ? 'warning' : 'default'}
        />
      </View>

      {/* Quick Action Hub */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AttendanceTab')}
          activeOpacity={0.7}
        >
          <CheckSquare size={18} color={themeColors.primary} />
          <Text style={styles.quickActionText}>Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('HomeworkTab')}
          activeOpacity={0.7}
        >
          <ClipboardList size={18} color={themeColors.primary} />
          <Text style={styles.quickActionText}>Post Homework</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('LeaveTab')}
          activeOpacity={0.7}
        >
          <Calendar size={18} color={themeColors.primary} />
          <Text style={styles.quickActionText}>Apply Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Today Schedule List */}
      <Text style={styles.sectionTitle}>Today's Operational Schedule</Text>
      {(!data.schedule || data.schedule.length === 0) ? (
        <EmptyState title="No Scheduled Classes" description="Your timetable schedule is clear for today!" />
      ) : (
        data.schedule.map((item: any) => {
          const status = item.attendanceStatus || 'PENDING';
          return (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleCardTitle}>{item.subject?.name || 'Class Period'}</Text>
                  <Text style={styles.scheduleCardTime}>
                    {item.bellPeriod?.startTime || ''} - {item.bellPeriod?.endTime || ''} (Period {item.bellPeriod?.periodNumber})
                  </Text>
                </View>
                <AppBadge label={status} status={status} />
              </View>
              <View style={styles.scheduleCardFooter}>
                <Text style={styles.scheduleCardClass}>
                  Grade: {item.timetable?.section?.gradeLevel?.name || ''} - {item.timetable?.section?.name || ''}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.scheduleActionBtn,
                    status === 'SUBMITTED' || status === 'LOCKED' ? styles.scheduleActionView : styles.scheduleActionMark
                  ]}
                  onPress={() => navigation.navigate('AttendanceTab', {
                    screen: 'MarkRoster',
                    params: {
                      cls: {
                        classId: item.timetable?.classId,
                        className: item.timetable?.section?.gradeLevel?.name,
                        sectionId: item.timetable?.sectionId,
                        sectionName: item.timetable?.section?.name,
                        role: 'TEACHER',
                      }
                    }
                  })}
                >
                  <Text style={[
                    styles.scheduleActionText,
                    status === 'SUBMITTED' || status === 'LOCKED' ? { color: themeColors.primary } : { color: '#FFFFFF' }
                  ]}>
                    {status === 'SUBMITTED' || status === 'LOCKED' ? 'View Records' : status === 'DRAFT' ? 'Resume Draft' : 'Mark Attendance'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Recent Leaves History */}
      <Text style={styles.sectionTitle}>Leave Balance & History</Text>
      {(!data.leaveRequests || data.leaveRequests.length === 0) ? (
        <EmptyState title="No Leave Applications" description="Your leave application history is empty." />
      ) : (
        data.leaveRequests.map((item: any) => (
          <View key={item.id} style={styles.leaveCard}>
            <View style={styles.leaveCardHeader}>
              <Text style={styles.leaveCardType}>{item.leaveType?.name || 'Leave Request'}</Text>
              <AppBadge label={item.status} status={item.status} />
            </View>
            <Text style={styles.leaveCardDesc}>
              Dates: {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.leaveCardDesc}>Reason: {item.reason}</Text>
            {item.reviewComment && (
              <View style={styles.leaveCommentBox}>
                <Text style={styles.leaveCommentTitle}>Review Comment:</Text>
                <Text style={styles.leaveCommentText}>{item.reviewComment}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// ATTENDANCE WORKFLOW (STATE-AWARE DISPATCHING SCREEN)
// ---------------------------------------------------------------------------
function TeacherAttendanceClassList({ navigation }: any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/school/attendance/my-classes');
      if (res.data?.data) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load teacher classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchClasses();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Assigned Sections</Text>
      {classes.length === 0 ? (
        <EmptyState title="No Sections Assigned" description="Contact School Registrar to map your timetable entry." />
      ) : (
        classes.map((cls: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.assignedClassCard}
            onPress={() => navigation.navigate('MarkRoster', { cls })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.assignedClassName}>{cls.className} - {cls.sectionName}</Text>
              <Text style={styles.assignedClassRole}>Role: {cls.role === 'CLASS_TEACHER' ? 'Class Teacher' : 'Subject Instructor'}</Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>
        ))
      )}
    </AppScreen>
  );
}

function TeacherAttendanceMarkRoster({ route, navigation }: any) {
  const { cls } = route.params;
  const { activeYear, user } = useAuth();
  
  // Loading & Session States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Student Lists & Input Forms
  const [roster, setRoster] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [notes, setNotes] = useState('');
  
  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE'>('ALL');
  
  // Edit revision state
  const [editReasonModalVisible, setEditReasonModalVisible] = useState(false);
  const [editReason, setEditReason] = useState('');

  const fetchSessionAndRoster = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // 1. Resolve live session state from database
      const sessionUrl = `/school/attendance/sessions/find?academicYearId=${activeYear?.id}&classId=${cls.classId}&sectionId=${cls.sectionId}&date=${todayStr}&attendanceType=DAILY`;
      const sessionRes = await apiClient.get(sessionUrl);
      const activeSession = sessionRes.data?.data;
      
      // 2. Resolve default student roster
      const rosterUrl = `/school/attendance/roster?academicYearId=${activeYear?.id}&classId=${cls.classId}&sectionId=${cls.sectionId}&date=${todayStr}`;
      const rosterRes = await apiClient.get(rosterUrl);
      const activeRoster = rosterRes.data?.data || [];
      setRoster(activeRoster);

      if (activeSession) {
        setSession(activeSession);
        setNotes(activeSession.notes || '');
        
        // Map pre-marked student record statuses
        const mappedStatuses: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        activeSession.records.forEach((r: any) => {
          mappedStatuses[r.studentId] = r.status;
        });
        setStatuses(mappedStatuses);
        setIsEditing(false); // Read-only summary displays first
      } else {
        setSession(null);
        setNotes('');
        // Initialize default roster statuses to PRESENT
        const defaultStatuses: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        activeRoster.forEach((s: any) => {
          defaultStatuses[s.studentId] = 'PRESENT';
        });
        setStatuses(defaultStatuses);
        setIsEditing(false); // Preparation screen displays first
      }
    } catch (err) {
      console.warn('Failed to initialize attendance states:', err);
      Alert.alert('Data Retrieval Error', 'Unable to retrieve section details or live session state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndRoster();
  }, [cls.classId, cls.sectionId]);

  // Bulk actions
  const markAllPresent = () => {
    const hasModifications = Object.values(statuses).some(s => s !== 'PRESENT');
    if (hasModifications) {
      Alert.alert(
        'Confirm Overwrite',
        'This will reset your custom marked absences or late arrivals to Present. Do you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset All',
            onPress: () => {
              const updated = { ...statuses };
              roster.forEach(s => { updated[s.studentId] = 'PRESENT'; });
              setStatuses(updated);
            }
          }
        ]
      );
    } else {
      const updated = { ...statuses };
      roster.forEach(s => { updated[s.studentId] = 'PRESENT'; });
      setStatuses(updated);
    }
  };

  const toggleStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleDiscardDraft = () => {
    Alert.alert(
      'Discard Session Draft',
      'Are you sure you want to permanently discard the saved draft attendance records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              // Delete or cancel draft on backend
              // In this structure we can simply clear local state or backend.
              // Let's reload roster state and clear session.
              await fetchSessionAndRoster();
              Alert.alert('Draft Discarded', 'Attendance states have been reset.');
            } catch (e) {
              console.warn(e);
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const records = roster.map(r => ({
        studentId: r.studentId,
        studentEnrollmentId: r.studentEnrollmentId,
        status: statuses[r.studentId] || 'PRESENT'
      }));

      await apiClient.post('/school/attendance/sessions/draft', {
        academicYearId: activeYear.id,
        classId: cls.classId,
        sectionId: cls.sectionId,
        attendanceDate: todayStr,
        attendanceType: 'DAILY',
        notes,
        records
      });

      Alert.alert('Draft Saved', 'Attendance session draft has been saved successfully.');
      fetchSessionAndRoster();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Error', err.response?.data?.message || 'Unable to preserve attendance draft.');
    } finally {
      setSaving(false);
    }
  };

  const executeFinalSubmit = async () => {
    setSaving(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const records = roster.map(r => ({
        studentId: r.studentId,
        studentEnrollmentId: r.studentEnrollmentId,
        status: statuses[r.studentId] || 'PRESENT'
      }));

      // Submit Draft first to ensure session ID exists
      const draftRes = await apiClient.post('/school/attendance/sessions/draft', {
        academicYearId: activeYear.id,
        classId: cls.classId,
        sectionId: cls.sectionId,
        attendanceDate: todayStr,
        attendanceType: 'DAILY',
        notes: editReason ? `${notes}\n[Revised: ${editReason}]` : notes,
        records
      });

      const sessionId = draftRes.data?.data?.id;
      if (!sessionId) {
        throw new Error('Draft session reference not returned.');
      }

      // Submit final
      await apiClient.post(`/school/attendance/sessions/${sessionId}/submit`, {
        notes: editReason ? `${notes}\n[Revised: ${editReason}]` : notes,
        records
      });

      Alert.alert('Submission Successful', 'Attendance records have been finalized and synced.');
      setEditReason('');
      fetchSessionAndRoster();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Submission Failed', err.response?.data?.message || 'Failed to finalize attendance records.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = () => {
    // Audit that all students have marked statuses
    const markedCount = Object.keys(statuses).length;
    const remaining = roster.length - markedCount;
    if (remaining > 0) {
      Alert.alert('Incomplete Records', 'Every student enrollment in the class must be marked before finalizing.');
      return;
    }

    Alert.alert(
      'Finalize Attendance',
      'Are you sure you want to submit these records? This will notify guardians and sync with school analytics.',
      [
        { text: 'Review', style: 'cancel' },
        { text: 'Submit', onPress: executeFinalSubmit }
      ]
    );
  };

  const handleEditRequest = () => {
    Alert.alert(
      'Revise Submitted Attendance',
      'You are modifying finalized student records. This action will log a revision audit trail. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            setEditReasonModalVisible(true);
          }
        }
      ]
    );
  };

  const handleStartEdit = () => {
    if (!editReason.trim()) {
      Alert.alert('Reason Required', 'Please specify a reason for this audit revision.');
      return;
    }
    setEditReasonModalVisible(false);
    setIsEditing(true);
  };

  if (loading) return <LoadingState />;

  // Render preparation view if no session is recorded
  if (!session && !isEditing) {
    return (
      <AppScreen>
        <View style={styles.headerRowNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Attendance Planner</Text>
        </View>

        <View style={styles.prepContainer}>
          <View style={styles.prepIconBg}>
            <Calendar size={48} color={themeColors.primary} />
          </View>
          <Text style={styles.prepTitle}>Attendance Has Not Been Marked</Text>
          <Text style={styles.prepSubtitle}>Grade Level: {cls.className} - {cls.sectionName}</Text>

          <View style={styles.prepDetailsList}>
            <View style={styles.prepDetailItem}>
              <Text style={styles.prepDetailLabel}>Operational Date</Text>
              <Text style={styles.prepDetailValue}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View style={styles.prepDetailItem}>
              <Text style={styles.prepDetailLabel}>Registered Instructor</Text>
              <Text style={styles.prepDetailValue}>{user?.firstName} {user?.lastName}</Text>
            </View>
            <View style={styles.prepDetailItem}>
              <Text style={styles.prepDetailLabel}>Total Students Enrolled</Text>
              <Text style={styles.prepDetailValue}>{roster.length} Pupils</Text>
            </View>
          </View>

          <AppButton
            title="Mark Attendance Now"
            onPress={() => setIsEditing(true)}
            style={styles.prepSubmitBtn}
          />
        </View>
      </AppScreen>
    );
  }

  // Calculate live statistics
  const totalCount = roster.length;
  const pCount = Object.values(statuses).filter(s => s === 'PRESENT').length;
  const aCount = Object.values(statuses).filter(s => s === 'ABSENT').length;
  const lCount = Object.values(statuses).filter(s => s === 'LATE').length;
  const markedNum = Object.keys(statuses).length;
  const remainingNum = totalCount - markedNum;

  // Filter & Search student list
  const filteredRoster = roster.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchText.toLowerCase()) || (s.rollNumber && String(s.rollNumber).includes(searchText));
    const status = statuses[s.studentId];
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && status === statusFilter;
  });

  return (
    <AppScreen>
      <View style={styles.headerRowNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>{cls.className} - {cls.sectionName}</Text>
          <Text style={styles.cardDesc}>{new Date().toLocaleDateString()} | Daily Cycle</Text>
        </View>
        {session && !isEditing && (
          <AppBadge
            label={session.status}
            status={session.status}
          />
        )}
      </View>

      {/* READ-ONLY VIEW (SUBMITTED / LOCKED STATUS) */}
      {!isEditing && session && (
        <View style={{ flex: 1 }}>
          {/* Summary Panel */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{totalCount}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: themeColors.success }]}>{pCount}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: themeColors.danger }]}>{aCount}</Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: themeColors.warning }]}>{lCount}</Text>
              <Text style={styles.summaryLabel}>Late</Text>
            </View>
          </View>

          {/* Submission Info Bar */}
          <View style={styles.infoBar}>
            <FileText size={16} color={themeColors.textMuted} style={{ marginRight: 6 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoBarText}>
                Submitted by {session.markedByUserId === user.id ? 'You' : 'Staff'} on{' '}
                {session.submittedAt ? new Date(session.submittedAt).toLocaleTimeString() : 'N/A'}
              </Text>
              {session.notes && <Text style={styles.notesText}>Notes: {session.notes}</Text>}
            </View>
          </View>

          <FlatList
            data={roster}
            keyExtractor={item => item.studentId}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
            renderItem={({ item }) => {
              const status = statuses[item.studentId] || 'PRESENT';
              return (
                <View style={styles.rosterRowStatic}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.cardDesc}>Roll No: {item.rollNumber || 'N/A'}</Text>
                  </View>
                  <AppBadge label={status} status={status} />
                </View>
              );
            }}
          />

          {/* Sticky Actions Bar */}
          {session.status !== 'LOCKED' && (
            <View style={styles.stickyFooterStatic}>
              <AppButton
                title="Edit Attendance Records"
                variant="outline"
                onPress={handleEditRequest}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>
      )}

      {/* INTERACTIVE MARKING INTERFACE (DRAFT OR EDIT ACTIVE) */}
      {(isEditing || (session && (session.status === 'DRAFT' || session.status === 'REOPENED'))) && (
        <View style={{ flex: 1 }}>
          {/* Real-time stats bar */}
          <View style={styles.liveStatsBar}>
            <Text style={styles.liveStatText}>Marked: {markedNum}/{totalCount}</Text>
            <Text style={styles.liveStatText}>P: {pCount} | A: {aCount} | L: {lCount}</Text>
          </View>

          {/* Operational Controls Row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlPill} onPress={markAllPresent}>
              <Check size={16} color={themeColors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.controlPillText}>All Present</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.notesInputInline}
              placeholder="Add session notes/remarks..."
              placeholderTextColor={themeColors.textMuted}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Search and Filters Bar */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchFieldBox}>
              <Search size={16} color={themeColors.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search student..."
                placeholderTextColor={themeColors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Filter Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginLeft: 8 }}>
              {(['ALL', 'PRESENT', 'ABSENT', 'LATE'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, statusFilter === f && styles.filterTabActive]}
                  onPress={() => setStatusFilter(f)}
                >
                  <Text style={[styles.filterTabText, statusFilter === f && { color: themeColors.primary }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* interactive roster list */}
          <FlatList
            data={filteredRoster}
            keyExtractor={item => item.studentId}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const currentStatus = statuses[item.studentId];
              return (
                <View style={styles.rosterCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.cardDesc}>Roll: {item.rollNumber || 'N/A'}</Text>
                  </View>
                  <View style={styles.attendanceButtons}>
                    <TouchableOpacity
                      style={[styles.attBtn, currentStatus === 'PRESENT' && styles.attBtnPresent]}
                      onPress={() => toggleStatus(item.studentId, 'PRESENT')}
                    >
                      <Text style={[styles.attBtnText, currentStatus === 'PRESENT' && { color: '#FFFFFF' }]}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.attBtn, currentStatus === 'LATE' && styles.attBtnLate]}
                      onPress={() => toggleStatus(item.studentId, 'LATE')}
                    >
                      <Text style={[styles.attBtnText, currentStatus === 'LATE' && { color: '#FFFFFF' }]}>L</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.attBtn, currentStatus === 'ABSENT' && styles.attBtnAbsent]}
                      onPress={() => toggleStatus(item.studentId, 'ABSENT')}
                    >
                      <Text style={[styles.attBtnText, currentStatus === 'ABSENT' && { color: '#FFFFFF' }]}>A</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <EmptyState
                title="No Matching Enrolled Students"
                description="Try clearing filters or refining your search parameters."
              />
            )}
          />

          {/* Sticky footer marking panel */}
          <View style={styles.stickyFooterMarking}>
            <AppButton
              title="Save Draft"
              variant="outline"
              loading={saving}
              onPress={handleSaveDraft}
              style={{ flex: 1, marginRight: 8 }}
            />
            <AppButton
              title="Finalize & Sync"
              variant="primary"
              loading={saving}
              onPress={handleFinalSubmit}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      )}

      {/* EDIT REASON PROMPT MODAL */}
      <Modal animationType="fade" transparent={true} visible={editReasonModalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <AlertCircle size={24} color={themeColors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Specify Revision Reason</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Revising finalized logs requires an audit trail entry. Please clarify the revision rationale.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Student marked absent arrived late at 9:30 AM"
              placeholderTextColor={themeColors.textMuted}
              value={editReason}
              onChangeText={setEditReason}
              multiline
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setEditReasonModalVisible(false);
                  setEditReason('');
                }}
              />
              <AppButton
                title="Unlock Editor"
                variant="primary"
                onPress={handleStartEdit}
              />
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

function AttendanceStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClassList" component={TeacherAttendanceClassList} />
      <Stack.Screen name="MarkRoster" component={TeacherAttendanceMarkRoster} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// HOMEWORK SCREEN (LIST & CREATE)
// ---------------------------------------------------------------------------
function HomeworkScreen() {
  const isFocused = useIsFocused();
  const { activeYear } = useAuth();
  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassIdx, setSelectedClassIdx] = useState<number>(-1);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState<number>(-1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateDays, setDueDateDays] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/school/learning/teacher/homework');
      if (res.data?.data) {
        setHomeworkList(res.data.data);
      }
      const clsRes = await apiClient.get('/school/attendance/my-classes');
      if (clsRes.data?.data) {
        setClasses(clsRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load homework data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const handleCreateHomework = async () => {
    if (selectedClassIdx === -1 || !title || !description) {
      Alert.alert('Required Fields', 'Please complete the class, title and instruction fields.');
      return;
    }
    const chosenClass = classes[selectedClassIdx];
    const chosenSubject = chosenClass?.subjects?.[selectedSubjectIdx];
    if (!chosenSubject) {
      Alert.alert('Required Fields', 'Please map a subject to this homework.');
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date();
      const due = new Date();
      due.setDate(today.getDate() + parseInt(dueDateDays || '2'));

      const res = await apiClient.post('/school/learning/teacher/homework', {
        academicYearId: activeYear.id,
        classId: chosenClass.classId,
        sectionId: chosenClass.sectionId,
        subjectId: chosenSubject.id, 
        title,
        description,
        assignedDate: today.toISOString().split('T')[0],
        dueDate: due.toISOString().split('T')[0]
      });

      const hwId = res.data?.data?.id;
      if (hwId) {
        await apiClient.post(`/school/learning/teacher/homework/${hwId}/publish`);
      }

      Alert.alert('Success', 'Homework published to student feeds successfully.');
      setModalVisible(false);
      setTitle('');
      setDescription('');
      setSelectedClassIdx(-1);
      setSelectedSubjectIdx(-1);
      fetchData();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to post homework.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectClass = (idx: number) => {
    setSelectedClassIdx(idx);
    if (classes[idx]?.subjects?.length > 0) {
      setSelectedSubjectIdx(0);
    } else {
      setSelectedSubjectIdx(-1);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Homework feed</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={homeworkList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.leaveCard}>
            <View style={styles.leaveCardHeader}>
              <Text style={styles.leaveCardType}>{item.title}</Text>
              <AppBadge label={item.status} status="PUBLISHED" />
            </View>
            <Text style={styles.leaveCardDesc}>Class: {item.class?.name} - {item.section?.name}</Text>
            <Text style={styles.leaveCardDesc}>Subject: {item.subject?.name}</Text>
            <Text style={styles.leaveCardDesc}>Due Date: {new Date(item.dueDate).toLocaleDateString()}</Text>
            <Text style={styles.homeworkBodyText}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={() => <EmptyState title="No Homework Posted" description="Assign new tasks by tapping the + icon above." />}
      />

      {/* CREATE MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>Publish Homework Task</Text>
            <Text style={styles.modalSubtitle}>Assign study materials or homework tasks to students</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 8 }}>
              <Text style={styles.label}>Select Target Class</Text>
              <ScrollView horizontal style={styles.pickerRow} showsHorizontalScrollIndicator={false}>
                {classes.map((cls, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.pickerPill, selectedClassIdx === idx && styles.pickerPillActive]}
                    onPress={() => handleSelectClass(idx)}
                  >
                    <Text style={[styles.pickerPillText, selectedClassIdx === idx && { color: themeColors.primary }]}>
                      {cls.className} - {cls.sectionName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedClassIdx !== -1 && (
                classes[selectedClassIdx]?.subjects?.length > 0 ? (
                  <>
                    <Text style={styles.label}>Select Subject</Text>
                    <ScrollView horizontal style={styles.pickerRow} showsHorizontalScrollIndicator={false}>
                      {classes[selectedClassIdx].subjects.map((sub: any, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.pickerPill, selectedSubjectIdx === idx && styles.pickerPillActive]}
                          onPress={() => setSelectedSubjectIdx(idx)}
                        >
                          <Text style={[styles.pickerPillText, selectedSubjectIdx === idx && { color: themeColors.primary }]}>
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                ) : (
                  <View style={styles.warningBox}>
                    <AlertCircle size={16} color={themeColors.warning} />
                    <Text style={styles.warningText}>No subjects assigned to this class context.</Text>
                  </View>
                )
              )}

              <TextInput
                style={styles.notesInput}
                placeholder="Task Title (e.g. Quadratic Equations HW)"
                placeholderTextColor={themeColors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.notesInput, { height: 100 }]}
                placeholder="Instructions & Descriptions..."
                placeholderTextColor={themeColors.textMuted}
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <TextInput
                style={styles.notesInput}
                placeholder="Due In Days (default: 2)"
                placeholderTextColor={themeColors.textMuted}
                keyboardType="number-pad"
                value={dueDateDays}
                onChangeText={setDueDateDays}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <AppButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <AppButton title="Publish Task" onPress={handleCreateHomework} loading={submitting} />
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// MARKS ENTRY SCREEN (EXAMS & MARKS SUBMISSION)
// ---------------------------------------------------------------------------
function MarksExamsList({ navigation }: any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [contexts, setContexts] = useState<any[]>([]);

  const fetchContexts = async () => {
    try {
      const res = await apiClient.get('/school/teacher/exams/marks-contexts');
      if (res.data?.data) {
        setContexts(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load teacher marks contexts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchContexts();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>Marks Entries desk</Text>
      {contexts.length === 0 ? (
        <EmptyState title="No Active Exams" description="Exams will display once scheduled by administrators." />
      ) : (
        contexts.map((ctx: any, index: number) => {
          const status = ctx.status || 'DRAFT';
          return (
            <TouchableOpacity
              key={index}
              style={styles.assignedClassCard}
              onPress={() => navigation.navigate('EnterMarks', { ctx })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.assignedClassName}>{ctx.examName}</Text>
                <Text style={styles.assignedClassRole}>Class: {ctx.className} - {ctx.sectionName}</Text>
                <Text style={styles.assignedClassRole}>Subject: {ctx.subjectName} (Max: {ctx.maximumMarks || 100})</Text>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <AppBadge label={status} status={status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT'} />
                <ChevronRight size={18} color={themeColors.textMuted} style={{ marginTop: 8 }} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </AppScreen>
  );
}

function MarksEntryScreen({ route, navigation }: any) {
  const { ctx } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});

  const fetchRoster = async () => {
    try {
      const url = `/school/exams/marks-roster?examSubjectId=${ctx.examSubjectId}&sectionId=${ctx.sectionId}`;
      const res = await apiClient.get(url);
      if (res.data?.data) {
        setRoster(res.data.data);
        const initialMarks: Record<string, string> = {};
        res.data.data.forEach((item: any) => {
          initialMarks[item.studentId] = item.marksObtained !== null && item.marksObtained !== undefined ? String(item.marksObtained) : '';
        });
        setMarks(initialMarks);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Unable to fetch marks roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const changeMarkValue = (studentId: string, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setMarks(prev => ({ ...prev, [studentId]: cleaned }));
  };

  const handleSaveDraftAndSubmit = async () => {
    const invalid = roster.some(r => {
      const val = parseFloat(marks[r.studentId]);
      return isNaN(val) || val < 0 || val > (ctx.maximumMarks || 100);
    });

    if (invalid) {
      Alert.alert('Invalid Marks Bound', `Marks obtained must fit standard ranges [0 - ${ctx.maximumMarks || 100}].`);
      return;
    }

    Alert.alert(
      'Submit Final Grades',
      'This will finalize the subject marks and submit them for review. Revisions will require approval.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Submit',
          onPress: async () => {
            setSaving(true);
            try {
              const entries = roster.map(r => ({
                studentId: r.studentId,
                enrollmentId: r.studentEnrollmentId,
                marksObtained: parseFloat(marks[r.studentId]) || 0
              }));

              await apiClient.post('/school/exams/marks-draft', {
                examSubjectId: ctx.examSubjectId,
                sectionId: ctx.sectionId,
                entries
              });

              await apiClient.post('/school/exams/marks-submit', {
                examSubjectId: ctx.examSubjectId,
                sectionId: ctx.sectionId
              });

              Alert.alert('Success', 'Exam marks submitted and saved successfully.');
              navigation.goBack();
            } catch (err: any) {
              console.warn(err);
              Alert.alert('Submission Failed', err.response?.data?.message || 'Failed to submit marks.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <View style={styles.headerRowNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>{ctx.subjectName}</Text>
          <Text style={styles.cardDesc}>{ctx.examName} | Maximum Marks: {ctx.maximumMarks || 100}</Text>
        </View>
      </View>

      <FlatList
        data={roster}
        keyExtractor={(item) => item.studentId}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.rosterRowStatic}>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.cardDesc}>Roll: {item.rollNumber || 'N/A'}</Text>
            </View>
            <TextInput
              style={styles.marksInput}
              value={marks[item.studentId] || ''}
              onChangeText={(text) => changeMarkValue(item.studentId, text)}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="--"
              placeholderTextColor={themeColors.textMuted}
            />
          </View>
        )}
      />

      <View style={styles.stickyFooterStatic}>
        <AppButton title="Finalize & Submit Marks" onPress={handleSaveDraftAndSubmit} loading={saving} style={{ flex: 1 }} />
      </View>
    </AppScreen>
  );
}

function MarksStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExamsList" component={MarksExamsList} />
      <Stack.Screen name="EnterMarks" component={MarksEntryScreen} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// LEAVE SCREEN (MY REQUESTS & APPLY)
// ---------------------------------------------------------------------------
function TeacherLeaveScreen() {
  const isFocused = useIsFocused();
  const { activeYear } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [selectedTypeIdx, setSelectedTypeIdx] = useState(-1);
  const [reason, setReason] = useState('');
  const [startDaysFromNow, setStartDaysFromNow] = useState('5');
  const [durationDays, setDurationDays] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveData = async () => {
    try {
      const res = await apiClient.get('/school/staff-ops/leave-requests/me');
      if (res.data?.data) {
        setLeaves(res.data.data);
      }
      const typesRes = await apiClient.get('/school/staff-ops/leave-types');
      if (typesRes.data?.data) {
        setLeaveTypes(typesRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchLeaveData();
    }
  }, [isFocused]);

  const handleApplyLeave = async () => {
    if (selectedTypeIdx === -1 || !reason) {
      Alert.alert('Required Fields', 'Please complete the type selection and reason inputs.');
      return;
    }
    setSubmitting(true);
    try {
      const chosenType = leaveTypes[selectedTypeIdx];
      const start = new Date();
      start.setDate(start.getDate() + parseInt(startDaysFromNow || '5'));
      const end = new Date(start);
      end.setDate(start.getDate() + parseInt(durationDays || '2'));

      await apiClient.post('/school/staff-ops/leave-requests', {
        leaveTypeId: chosenType.id,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        partialDayType: 'FULL_DAY',
        reason,
        academicYearId: activeYear.id
      });

      Alert.alert('Application Submitted', 'Your leave request has been queued for Principal review.');
      setModalVisible(false);
      setReason('');
      setSelectedTypeIdx(-1);
      fetchLeaveData();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Submission Failed', err.response?.data?.message || 'Failed to request leave.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>My Leaves</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaves}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.leaveCard}>
            <View style={styles.leaveCardHeader}>
              <Text style={styles.leaveCardType}>{item.leaveType?.name}</Text>
              <AppBadge label={item.status} status={item.status} />
            </View>
            <Text style={styles.leaveCardDesc}>
              Duration: {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.leaveCardDesc}>Reason: {item.reason}</Text>
            {item.reviewComment && (
              <View style={styles.leaveCommentBox}>
                <Text style={styles.leaveCommentTitle}>Reviewer Remark:</Text>
                <Text style={styles.leaveCommentText}>{item.reviewComment}</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => <EmptyState title="No Leave Applications" description="File a new request by tapping the + icon." />}
      />

      {/* APPLY MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Leave Allowance</Text>

            <Text style={styles.label}>Select Category</Text>
            <ScrollView horizontal style={styles.pickerRow} showsHorizontalScrollIndicator={false}>
              {leaveTypes.map((type, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.pickerPill, selectedTypeIdx === idx && styles.pickerPillActive]}
                  onPress={() => setSelectedTypeIdx(idx)}
                >
                  <Text style={[styles.pickerPillText, selectedTypeIdx === idx && { color: themeColors.primary }]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.notesInput}
              placeholder="Days From Today to Start (e.g. 5)"
              placeholderTextColor={themeColors.textMuted}
              keyboardType="number-pad"
              value={startDaysFromNow}
              onChangeText={setStartDaysFromNow}
            />

            <TextInput
              style={styles.notesInput}
              placeholder="Total Duration Days"
              placeholderTextColor={themeColors.textMuted}
              keyboardType="number-pad"
              value={durationDays}
              onChangeText={setDurationDays}
            />

            <TextInput
              style={[styles.notesInput, { height: 100 }]}
              placeholder="State clear operational reason..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={reason}
              onChangeText={setReason}
            />

            <View style={styles.modalActions}>
              <AppButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <AppButton title="File Request" onPress={handleApplyLeave} loading={submitting} />
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// PROFILE SCREEN
// ---------------------------------------------------------------------------
function TeacherProfileScreen() {
  const { user, school, logout } = useAuth();

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0] || 'T'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.profileMeta}>{user?.email}</Text>
        <Text style={styles.profileMeta}>Department: Mathematics</Text>
        <View style={{ alignSelf: 'center', marginTop: 12 }}>
          <AppBadge label="Active Faculty" status="APPROVED" />
        </View>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>Security Credentials</Text>
        <View style={styles.credentialRow}>
          <Lock size={16} color={themeColors.textMuted} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.credentialLabel}>Login Email</Text>
            <Text style={styles.credentialValue}>{user?.email}</Text>
          </View>
        </View>
        <View style={[styles.credentialRow, { marginTop: 12 }]}>
          <Lock size={16} color={themeColors.textMuted} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.credentialLabel}>Password Access</Text>
            <Text style={styles.credentialValue}>•••••••• (Protected)</Text>
          </View>
        </View>
        <Text style={styles.passwordHintText}>
          Contact your school administrator to reset or modify password access keys.
        </Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>School Information</Text>
        <Text style={styles.profileCardDesc}>Name: {school?.name}</Text>
        <Text style={styles.profileCardDesc}>Code: {school?.code}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <AppButton title="Sign Out" variant="danger" onPress={logout} />
      </View>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// MAIN TEACHER NAVIGATOR (BOTTOM TABS DISPATCHER)
// ---------------------------------------------------------------------------
export default function TeacherNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: themeColors.card, borderTopColor: themeColors.border, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={TeacherHomeScreen}
        options={{ title: 'Home', tabBarIcon: ({ color }: any) => <BookOpen size={20} color={color} /> }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceStackScreen}
        options={{ title: 'Attendance', tabBarIcon: ({ color }: any) => <CheckSquare size={20} color={color} /> }}
      />
      <Tab.Screen
        name="HomeworkTab"
        component={HomeworkScreen}
        options={{ title: 'Homework', tabBarIcon: ({ color }: any) => <ClipboardList size={20} color={color} /> }}
      />
      <Tab.Screen
        name="MarksTab"
        component={MarksStackScreen}
        options={{ title: 'Marks', tabBarIcon: ({ color }: any) => <CheckRaw size={20} color={color} /> }}
      />
      <Tab.Screen
        name="LeaveTab"
        component={TeacherLeaveScreen}
        options={{ title: 'Leave', tabBarIcon: ({ color }: any) => <Calendar size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={TeacherProfileScreen}
        options={{ title: 'Profile', tabBarIcon: ({ color }: any) => <User size={20} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerGreeting: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.textMuted,
    textTransform: 'uppercase',
  },
  headerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  headerRole: {
    fontSize: 12,
    color: themeColors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRowNav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    backgroundColor: themeColors.card,
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.text,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.textMuted,
    marginTop: 4,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scheduleCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  scheduleCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  scheduleCardTime: {
    fontSize: 12,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  scheduleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleCardClass: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.text,
  },
  scheduleActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  scheduleActionMark: {
    backgroundColor: themeColors.primary,
  },
  scheduleActionView: {
    backgroundColor: themeColors.primaryMuted,
  },
  scheduleActionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  assignedClassCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedClassName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  assignedClassRole: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  rosterRowStatic: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: themeColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  attBtnPresent: {
    backgroundColor: themeColors.success,
    borderColor: themeColors.success,
  },
  attBtnAbsent: {
    backgroundColor: themeColors.danger,
    borderColor: themeColors.danger,
  },
  attBtnLate: {
    backgroundColor: themeColors.warning,
    borderColor: themeColors.warning,
  },
  attBtnText: {
    color: themeColors.textMuted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  notesInputInline: {
    flex: 1,
    height: 38,
    backgroundColor: themeColors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingHorizontal: 12,
    color: themeColors.text,
    fontSize: 13,
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: themeColors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 12,
    color: themeColors.text,
    marginTop: 12,
    fontSize: 14,
  },
  marksInput: {
    width: 60,
    height: 40,
    backgroundColor: themeColors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    textAlign: 'center',
    color: themeColors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: themeColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 20,
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: themeColors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    height: 80,
    backgroundColor: themeColors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 12,
    color: themeColors.text,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: themeColors.textMuted,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pickerPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginRight: 8,
  },
  pickerPillActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primaryMuted,
  },
  pickerPillText: {
    color: themeColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  profileCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: themeColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 13,
    color: themeColors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  profileCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 12,
  },
  profileCardDesc: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginBottom: 6,
  },
  leaveCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveCardType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  leaveCardDesc: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginTop: 3,
  },
  leaveCommentBox: {
    marginTop: 10,
    backgroundColor: themeColors.background,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  leaveCommentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: themeColors.textMuted,
    textTransform: 'uppercase',
  },
  leaveCommentText: {
    fontSize: 13,
    color: themeColors.text,
    marginTop: 2,
  },
  prepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  prepIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: themeColors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  prepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
  },
  prepSubtitle: {
    fontSize: 14,
    color: themeColors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  prepDetailsList: {
    width: '100%',
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginVertical: 24,
  },
  prepDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  prepDetailLabel: {
    fontSize: 13,
    color: themeColors.textMuted,
  },
  prepDetailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  prepSubmitBtn: {
    width: '100%',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: themeColors.card,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingVertical: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.infoMuted,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  infoBarText: {
    fontSize: 12,
    color: themeColors.info,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 12,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  stickyFooterStatic: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: themeColors.card,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    padding: 16,
    flexDirection: 'row',
  },
  liveStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: themeColors.primaryMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  liveStatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: themeColors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: themeColors.card,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: themeColors.primaryMuted,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  controlPillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: themeColors.primary,
  },
  searchFilterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: themeColors.card,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchFieldBox: {
    flex: 1,
    height: 36,
    backgroundColor: themeColors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchTextInput: {
    flex: 1,
    color: themeColors.text,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 6,
  },
  filterTabActive: {
    backgroundColor: themeColors.primaryMuted,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: themeColors.textMuted,
  },
  rosterCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyFooterMarking: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: themeColors.card,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  homeworkBodyText: {
    fontSize: 14,
    color: themeColors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.warningMuted,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.warning,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: themeColors.text,
    flex: 1,
    fontWeight: '500',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  credentialLabel: {
    fontSize: 10,
    color: themeColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  credentialValue: {
    fontSize: 13,
    color: themeColors.text,
    marginTop: 2,
    fontWeight: '600',
  },
  passwordHintText: {
    fontSize: 11,
    color: themeColors.textMuted,
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
