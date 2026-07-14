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
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { AppScreen, LoadingState, EmptyState, MetricCard, AppButton, AppBadge, themeColors } from '../../components/ui';
import { useIsFocused } from '@react-navigation/native';
import {
  BookOpen as BookOpenRaw,
  Calendar as CalendarRaw,
  User as UserRaw,
  ChevronRight as ChevronRightRaw,
  ClipboardList as ClipboardListRaw,
  LogOut as LogOutRaw,
  ArrowLeft as ArrowLeftRaw,
  DollarSign as DollarSignRaw,
  Clock as ClockRaw,
  Check as CheckRaw,
  FileText as FileTextRaw,
} from 'lucide-react-native';

const BookOpen = BookOpenRaw as any;
const Calendar = CalendarRaw as any;
const User = UserRaw as any;
const ChevronRight = ChevronRightRaw as any;
const ClipboardList = ClipboardListRaw as any;
const LogOut = LogOutRaw as any;
const ArrowLeft = ArrowLeftRaw as any;
const DollarSign = DollarSignRaw as any;
const Clock = ClockRaw as any;
const Check = CheckRaw as any;
const FileText = FileTextRaw as any;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ---------------------------------------------------------------------------
// STUDENT HOME SCREEN
// ---------------------------------------------------------------------------
function StudentHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>(null);

  const fetchHome = async () => {
    try {
      const res = await apiClient.get('/mobile/student/home');
      if (res.data?.data) {
        setHomeData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load student home:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchHome();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      {/* Executive Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <Text style={styles.headerName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.headerRole}>
            Class: {homeData?.classDetails?.gradeName || ''} - {homeData?.classDetails?.sectionName || ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={themeColors.danger} />
        </TouchableOpacity>
      </View>

      {/* Primary KPI Panels */}
      <View style={styles.metricGrid}>
        <MetricCard title="Attendance Average" value={`${homeData?.attendancePercentage ?? 100}%`} variant="success" />
        <MetricCard
          title="Tuition Fees Due"
          value={`₹${(homeData?.outstandingFeesTotal ?? 0) / 100}`}
          variant={homeData?.outstandingFeesTotal > 0 ? 'danger' : 'default'}
        />
      </View>

      <View style={styles.metricGrid}>
        <MetricCard title="Homework Tasks" value={homeData?.homeworkCount ?? 0} />
        <MetricCard title="Assignments Queue" value={homeData?.assignmentsCount ?? 0} />
      </View>

      {/* Today's Roll Call Status */}
      <Text style={styles.sectionTitle}>Today's Attendance Status</Text>
      <View style={styles.clickableCard}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.cardTitle, { marginRight: 8 }]}>Daily Roster Status</Text>
            <AppBadge
              label={homeData?.todayAttendance?.status || 'NOT_MARKED'}
              status={
                homeData?.todayAttendance?.status === 'PRESENT'
                  ? 'SUBMITTED'
                  : homeData?.todayAttendance?.status === 'ABSENT'
                  ? 'REJECTED'
                  : homeData?.todayAttendance?.status === 'LATE'
                  ? 'PENDING'
                  : 'LOCKED'
              }
            />
          </View>
          <Text style={styles.cardDesc}>
            Marked By: <Text style={{ fontWeight: '600', color: themeColors.text }}>{homeData?.todayAttendance?.markedBy || 'Not marked yet'}</Text>
          </Text>
          {homeData?.todayAttendance?.notes ? (
            <Text style={[styles.cardDesc, { fontStyle: 'italic', marginTop: 4 }]}>
              Notes: "{homeData.todayAttendance.notes}"
            </Text>
          ) : null}
        </View>
      </View>

      {/* Today's Timetable Preview */}
      <Text style={styles.sectionTitle}>Today's Lectures & Timings</Text>
      {(!homeData?.todaySchedule || homeData.todaySchedule.length === 0) ? (
        <EmptyState title="No Scheduled Classes Today" description="Enjoy your day off or catch up on homework tasks!" />
      ) : (
        homeData.todaySchedule.map((period: any) => (
          <View key={period.id} style={styles.clickableCard}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.cardTitle}>{period.subjectName}</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: themeColors.primary }}>
                  {period.startTime} - {period.endTime}
                </Text>
              </View>
              <Text style={styles.cardDesc}>Teacher: {period.teacherName} | Period {period.periodSequence}</Text>
            </View>
          </View>
        ))
      )}

      {/* Quick Launch Cards */}
      <Text style={styles.sectionTitle}>Dashboard Shortcuts</Text>
      
      <TouchableOpacity style={styles.clickableCard} onPress={() => navigation.navigate('TimetableTab')}>
        <Clock size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Daily Timetable</Text>
          <Text style={styles.cardDesc}>Check class periods and teacher schedules.</Text>
        </View>
        <ChevronRight size={18} color={themeColors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.clickableCard} onPress={() => navigation.navigate('HomeworkTab')}>
        <BookOpen size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Homework & Submissions</Text>
          <Text style={styles.cardDesc}>Submit text responses and track grades.</Text>
        </View>
        <ChevronRight size={18} color={themeColors.textMuted} />
      </TouchableOpacity>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// TIMETABLE SCREEN (DAY PICKER & PERIOD CARDS)
// ---------------------------------------------------------------------------
function StudentTimetableScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState('MONDAY');

  const fetchTimetable = async () => {
    try {
      const res = await apiClient.get('/school/student/timetable');
      if (res.data?.data?.entries) {
        setTimetable(res.data.data.entries);
      } else if (res.data?.data) {
        setTimetable(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load student timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchTimetable();
    }
  }, [isFocused]);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const filteredEntries = timetable.filter(item => item.dayOfWeek === selectedDay);

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>Class Timetable</Text>

      {/* Horizontal Day Switcher */}
      <ScrollView horizontal style={styles.pickerRow} showsHorizontalScrollIndicator={false}>
        {days.map((day) => {
          const isActive = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.pickerPill, isActive && styles.pickerPillActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.pickerPillText, isActive && { color: themeColors.primary }]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredEntries.sort((a, b) => (a.bellPeriod?.sortOrder || 0) - (b.bellPeriod?.sortOrder || 0))}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          // Parse current time to check if this period is active right now
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

          const parseTimeToMinutes = (timeStr: string) => {
            if (!timeStr) return -1;
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
          };

          const startMin = parseTimeToMinutes(item.bellPeriod?.startTime);
          const endMin = parseTimeToMinutes(item.bellPeriod?.endTime);
          const isCurrentPeriod = currentMinutesSinceMidnight >= startMin && currentMinutesSinceMidnight <= endMin;

          return (
            <View style={[styles.card, isCurrentPeriod && styles.currentPeriodCard]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.subject?.name || 'Study Period'}</Text>
                  {isCurrentPeriod && (
                    <Text style={styles.currentPeriodLabel}>⚡ CURRENT SESSION</Text>
                  )}
                </View>
                <Text style={[styles.badgeText, { color: themeColors.primary }]}>
                  {item.bellPeriod?.startTime} - {item.bellPeriod?.endTime}
                </Text>
              </View>
              <Text style={styles.cardDesc}>Teacher: {item.employee?.firstName} {item.employee?.lastName}</Text>
              <Text style={styles.cardDesc}>Location: Period {item.bellPeriod?.name}</Text>
            </View>
          );
        }}
        ListEmptyComponent={() => <EmptyState title="No Scheduled Lectures" description="Enjoy your break or holiday!" />}
      />
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// HOMEWORK & ASSIGNMENTS (LIST & DETAIL WITH STATES)
// ---------------------------------------------------------------------------
function StudentHomeworkList({ navigation }: any) {
  const isFocused = useIsFocused();
  const { activeYear } = useAuth();
  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'HOMEWORK' | 'ASSIGNMENTS'>('HOMEWORK');

  const fetchData = async () => {
    try {
      const hwRes = await apiClient.get(`/school/learning/student/homework?academicYearId=${activeYear.id}`);
      if (hwRes.data?.data) {
        setHomeworkList(hwRes.data.data);
      }
      const assignRes = await apiClient.get(`/school/learning/student/assignments?academicYearId=${activeYear.id}`);
      if (assignRes.data?.data) {
        setAssignments(assignRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load student homework/assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>My Tasks Desk</Text>

      {/* Segmented Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'HOMEWORK' && styles.tabBtnActive]}
          onPress={() => setActiveTab('HOMEWORK')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'HOMEWORK' && { color: themeColors.primary }]}>Daily Homework</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ASSIGNMENTS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ASSIGNMENTS')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ASSIGNMENTS' && { color: themeColors.primary }]}>Graded Projects</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'HOMEWORK' ? (
        <FlatList
          data={homeworkList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isOverdue = new Date(item.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {isOverdue ? (
                    <Text style={styles.overdueBadge}>⚠️ OVERDUE</Text>
                  ) : (
                    <Text style={[styles.badgeText, { color: themeColors.primary }]}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                  )}
                </View>
                <Text style={styles.cardDesc}>Subject: {item.subject?.name}</Text>
                <Text style={styles.homeworkBodyText}>{item.description}</Text>
              </View>
            );
          }}
          ListEmptyComponent={() => <EmptyState title="No Active Homework" description="All daily homework cycles completed!" />}
        />
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            // Determine badge status
            const hasSubmitted = item.submissions?.length > 0;
            const statusLabel = hasSubmitted ? 'SUBMITTED' : 'PENDING';
            return (
              <TouchableOpacity
                style={styles.clickableCard}
                onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: item.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>Subject: {item.subject?.name}</Text>
                  <Text style={styles.cardDesc}>Due: {new Date(item.dueAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <AppBadge label={statusLabel} status={statusLabel} />
                  <ChevronRight size={18} color={themeColors.textMuted} style={{ marginTop: 8 }} />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => <EmptyState title="No Active Projects" description="All school assignments completed!" />}
        />
      )}
    </AppScreen>
  );
}

function StudentAssignmentDetails({ route, navigation }: any) {
  const { assignmentId } = route.params;
  const { activeYear } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [response, setResponse] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await apiClient.get(`/school/learning/student/assignments/${assignmentId}`);
      if (res.data?.data) {
        setData(res.data.data);
        if (res.data.data.submission?.textResponse) {
          setResponse(res.data.data.submission.textResponse);
        }
      }
    } catch (err) {
      console.warn('Failed to load assignment details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleSubmit = async () => {
    if (!response.trim()) {
      Alert.alert('Required Fields', 'Please enter your submission text response before uploading.');
      return;
    }

    Alert.alert(
      'Submit Project Response',
      'This will finalize your response and notify the grading instructor. You cannot edit after submitting. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Now',
          onPress: async () => {
            setSubmitting(true);
            try {
              await apiClient.post(`/school/learning/student/assignments/${assignmentId}/submission`, {
                textResponse: response,
                academicYearId: activeYear.id
              });
              Alert.alert('Success', 'Assignment response uploaded successfully!');
              fetchDetails();
            } catch (err: any) {
              console.warn(err);
              Alert.alert('Upload Failed', err.response?.data?.message || 'Failed to submit assignment.');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) return <LoadingState />;

  const submission = data?.submission;
  const assignment = data?.assignment;
  
  // Status check
  const isGraded = submission?.status === 'GRADED';

  return (
    <AppScreen scrollable>
      <View style={styles.headerRowNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Project details</Text>
      </View>

      {/* Assignment Prompt Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{assignment?.title}</Text>
          <AppBadge
            label={submission ? submission.status : 'NOT STARTED'}
            status={submission ? submission.status : 'PENDING'}
          />
        </View>
        <Text style={styles.cardDesc}>Subject: {assignment?.subject?.name}</Text>
        <Text style={styles.cardDesc}>Max Score weightage: {assignment?.maximumMarks || 'N/A'} Points</Text>
        <Text style={styles.cardDesc}>Due: {new Date(assignment?.dueAt).toLocaleDateString()}</Text>
        <Text style={styles.homeworkBodyText}>{assignment?.description}</Text>
      </View>

      {/* Form Submission States */}
      {submission ? (
        <View style={styles.card}>
          <Text style={styles.formTitle}>Your Submission</Text>
          <View style={styles.infoBar}>
            <FileText size={16} color={themeColors.success} style={{ marginRight: 6 }} />
            <Text style={styles.infoBarText}>
              Uploaded on {new Date(submission.createdAt).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.submissionResponseText}>{submission.textResponse}</Text>
          
          {isGraded && (
            <View style={styles.gradedBox}>
              <Text style={styles.gradedTitle}>Instructor Assessment & Score</Text>
              <Text style={styles.gradedScore}>
                Grade Score: {submission.grade?.marksAwarded} / {assignment?.maximumMarks} Points
              </Text>
              <Text style={styles.gradedFeedback}>
                Remarks: {submission.grade?.feedback || 'No comments left by teacher.'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.formTitle}>Submit Project Response</Text>
          <TextInput
            style={styles.submissionTextInput}
            placeholder="Type your response here..."
            placeholderTextColor={themeColors.textMuted}
            multiline
            value={response}
            onChangeText={setResponse}
          />
          <AppButton title="Finalize & Upload Submission" onPress={handleSubmit} loading={submitting} />
        </View>
      )}
    </AppScreen>
  );
}

function HomeworkStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={StudentHomeworkList} />
      <Stack.Screen name="AssignmentDetails" component={StudentAssignmentDetails} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// EXAM RESULTS SCREEN
// ---------------------------------------------------------------------------
function StudentResultsList({ navigation }: any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  const fetchResults = async () => {
    try {
      const res = await apiClient.get('/school/student/exams/results');
      if (res.data?.data) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load student results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchResults();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Results Desk</Text>
      {exams.length === 0 ? (
        <EmptyState title="No Results Published" description="Exam card details will display once approved by Principal." />
      ) : (
        exams.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            style={styles.clickableCard}
            onPress={() => navigation.navigate('ResultDetail', { examId: item.examId, examName: item.examName })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.examName}</Text>
              <Text style={styles.cardDesc}>Marks: {item.totalMarksObtained} / {item.totalMaximumMarks}</Text>
              <Text style={styles.cardDesc}>Percentage: {item.percentage}%</Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
              <AppBadge label={item.resultStatus} status={item.resultStatus === 'PASS' ? 'SUBMITTED' : 'REJECTED'} />
              <ChevronRight size={18} color={themeColors.textMuted} style={{ marginTop: 8 }} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </AppScreen>
  );
}

function StudentResultDetail({ route, navigation }: any) {
  const { examId, examName } = route.params;
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any[]>([]);

  const fetchDetail = async () => {
    try {
      const res = await apiClient.get(`/school/student/exams/results/${examId}`);
      if (res.data?.data) {
        setDetails(res.data.data.subjectResults || []);
      }
    } catch (err) {
      console.warn('Failed to load result details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      <View style={styles.headerRowNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>{examName}</Text>
          <Text style={styles.cardDesc}>Subject Breakdown</Text>
        </View>
      </View>

      {details.map((sub: any, index: number) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{sub.examSubject?.subject?.name || sub.subjectName}</Text>
            <AppBadge label={sub.resultStatus} status={sub.resultStatus === 'PASS' ? 'SUBMITTED' : 'REJECTED'} />
          </View>
          <Text style={styles.cardDesc}>Score: {sub.totalMarksObtained} / {sub.maximumMarks}</Text>
          <Text style={styles.cardDesc}>Grade Scale: {sub.grade} ({sub.percentage}%)</Text>
        </View>
      ))}
    </AppScreen>
  );
}

// Stack result
function ResultsStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={StudentResultsList} />
      <Stack.Screen name="ResultDetail" component={StudentResultDetail} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// FEES SCREEN
// ---------------------------------------------------------------------------
function StudentFeesScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [feeAccount, setFeeAccount] = useState<any>(null);

  const fetchFeesData = async () => {
    try {
      const feeRes = await apiClient.get('/mobile/student/fees');
      if (feeRes.data?.data) {
        setFeeAccount(feeRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load student fee ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFeesData();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  const summary = feeAccount?.summary;
  const totalCharged = summary?.totalChargedMinor || 0;
  const totalPaid = summary?.totalPaidMinor || 0;
  const outstanding = summary?.totalOutstandingMinor || 0;

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>Tuition Fee Account</Text>

      {/* Aggregate Cards */}
      <View style={styles.metricGrid}>
        <MetricCard title="Total Charged" value={`₹${totalCharged / 100}`} />
        <MetricCard title="Total Paid" value={`₹${totalPaid / 100}`} variant="success" />
      </View>

      <View style={[styles.card, outstanding > 0 ? styles.dueCardAlert : styles.dueCardPaid]}>
        <Text style={styles.dueCardTitle}>Net Outstanding Balance</Text>
        <Text style={[styles.dueCardValue, outstanding > 0 ? { color: themeColors.danger } : { color: themeColors.success }]}>
          ₹{outstanding / 100}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Fee Installment Ledger</Text>
      {(!feeAccount?.charges || feeAccount.charges.length === 0) ? (
        <EmptyState title="No Mapped Fee Structures" description="Outstanding fees ledger is empty." />
      ) : (
        feeAccount.charges.map((c: any) => {
          const paidAmt = c.allocations?.reduce((sum: number, a: any) => sum + a.amountMinor, 0) ?? 0;
          const balance = c.amountMinor - paidAmt;
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{c.description || 'School installment charge'}</Text>
                <AppBadge label={c.status} status={c.status} />
              </View>
              <Text style={styles.cardDesc}>Total Mapped Cost: ₹{c.amountMinor / 100}</Text>
              <Text style={styles.cardDesc}>Cleared: ₹{paidAmt / 100} | Remaining: ₹{balance / 100}</Text>
              <Text style={styles.cardDesc}>Due Date: {new Date(c.dueDate).toLocaleDateString()}</Text>
            </View>
          );
        })
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// PROFILE SCREEN
// ---------------------------------------------------------------------------
function StudentProfileScreen() {
  const { user, school, logout, activeYear } = useAuth();

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0] || 'S'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.profileMeta}>{user?.email}</Text>
        <Text style={styles.profileMeta}>User Role: Active Student</Text>
        <View style={{ alignSelf: 'center', marginTop: 12 }}>
          <AppBadge label="Academic Status: Active" status="SUBMITTED" />
        </View>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>Security Credentials</Text>
        <View style={styles.credentialRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.credentialLabel}>Login Email</Text>
            <Text style={styles.credentialValue}>{user?.email}</Text>
          </View>
        </View>
        <View style={[styles.credentialRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
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
        <Text style={styles.profileCardDesc}>GIS Code: {school?.code}</Text>
        {activeYear && (
          <Text style={styles.profileCardDesc}>Current Term: {activeYear.name}</Text>
        )}
      </View>

      <View style={{ padding: 16 }}>
        <AppButton title="Sign Out" variant="danger" onPress={logout} />
      </View>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// ATTENDANCE HISTORY SCREEN
// ---------------------------------------------------------------------------
function StudentAttendanceScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAttendance = async () => {
    try {
      const res = await apiClient.get('/mobile/student/attendance');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load student attendance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAttendance();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  const summary = data?.summary;
  const records = data?.records || [];

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Attendance Registry</Text>

      {/* Aggregate Cards */}
      <View style={styles.metricGrid}>
        <MetricCard title="Attendance Average" value={`${summary?.percentage ?? 100}%`} variant="success" />
        <MetricCard title="Present Days" value={summary?.presentCount ?? 0} />
      </View>

      <View style={styles.metricGrid}>
        <MetricCard title="Absent Days" value={summary?.absentCount ?? 0} variant="danger" />
        <MetricCard title="Late Days" value={summary?.lateCount ?? 0} variant="default" />
      </View>

      <Text style={styles.sectionTitle}>30-Day Attendance Logs</Text>
      {records.length === 0 ? (
        <EmptyState title="No Attendance Logs Found" description="Daily roll call records will appear here once marked." />
      ) : (
        records.map((r: any) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              <AppBadge
                label={r.status}
                status={
                  r.status === 'PRESENT'
                    ? 'SUBMITTED'
                    : r.status === 'ABSENT'
                    ? 'REJECTED'
                    : r.status === 'LATE'
                    ? 'PENDING'
                    : 'LOCKED'
                }
              />
            </View>
            <Text style={styles.cardDesc}>
              Marked By: <Text style={{ fontWeight: '600', color: themeColors.text }}>{r.markedBy}</Text>
            </Text>
            {r.notes ? (
              <Text style={[styles.cardDesc, { fontStyle: 'italic', marginTop: 4 }]}>
                Notes: "{r.notes}"
              </Text>
            ) : null}
          </View>
        ))
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// STUDENT TABS DISPATCHER
// ---------------------------------------------------------------------------
export default function StudentNavigator() {
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
        component={StudentHomeScreen}
        options={{ title: 'Home', tabBarIcon: ({ color }: any) => <User size={20} color={color} /> }}
      />
      <Tab.Screen
        name="TimetableTab"
        component={StudentTimetableScreen}
        options={{ title: 'Timetable', tabBarIcon: ({ color }: any) => <Clock size={20} color={color} /> }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={StudentAttendanceScreen}
        options={{ title: 'Attendance', tabBarIcon: ({ color }: any) => <Calendar size={20} color={color} /> }}
      />
      <Tab.Screen
        name="HomeworkTab"
        component={HomeworkStackScreen}
        options={{ title: 'Tasks', tabBarIcon: ({ color }: any) => <BookOpen size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ResultsTab"
        component={ResultsStackScreen}
        options={{ title: 'Results', tabBarIcon: ({ color }: any) => <ClipboardList size={20} color={color} /> }}
      />
      <Tab.Screen
        name="FeesTab"
        component={StudentFeesScreen}
        options={{ title: 'Fees', tabBarIcon: ({ color }: any) => <DollarSign size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={StudentProfileScreen}
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
  card: {
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
  clickableCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  cardDesc: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  homeworkBodyText: {
    fontSize: 14,
    color: themeColors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: themeColors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primaryMuted,
  },
  tabBtnText: {
    color: themeColors.textMuted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  pickerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pickerPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: themeColors.card,
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
    fontWeight: 'bold',
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
  dueCardAlert: {
    backgroundColor: themeColors.dangerMuted,
    borderColor: themeColors.danger,
  },
  dueCardPaid: {
    backgroundColor: themeColors.successMuted,
    borderColor: themeColors.success,
  },
  dueCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.textMuted,
    textTransform: 'uppercase',
  },
  dueCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 12,
  },
  submissionResponseText: {
    fontSize: 14,
    color: themeColors.text,
    marginTop: 12,
    lineHeight: 20,
    backgroundColor: themeColors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  submissionTextInput: {
    height: 120,
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
  gradedBox: {
    marginTop: 16,
    backgroundColor: themeColors.successMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.success,
    padding: 12,
  },
  gradedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: themeColors.success,
    textTransform: 'uppercase',
  },
  gradedScore: {
    fontSize: 15,
    fontWeight: 'bold',
    color: themeColors.text,
    marginTop: 4,
  },
  gradedFeedback: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginTop: 4,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.infoMuted,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  infoBarText: {
    fontSize: 12,
    color: themeColors.info,
    fontWeight: '600',
  },
  currentPeriodCard: {
    borderColor: themeColors.primary,
    borderWidth: 2,
    backgroundColor: themeColors.primaryMuted,
  },
  currentPeriodLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: themeColors.primary,
    marginTop: 4,
  },
  overdueBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: themeColors.danger,
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
