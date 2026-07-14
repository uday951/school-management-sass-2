import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { AppScreen, LoadingState, EmptyState, MetricCard, AppBadge, AppButton, themeColors } from '../../components/ui';
import { useIsFocused } from '@react-navigation/native';
import {
  Users as UsersRaw,
  Calendar as CalendarRaw,
  Award as AwardRaw,
  DollarSign as DollarSignRaw,
  Bell as BellRaw,
  ChevronRight as ChevronRightRaw,
  LogOut as LogOutRaw,
  ArrowLeft as ArrowLeftRaw,
  User as UserRaw,
} from 'lucide-react-native';

const Users = UsersRaw as any;
const Calendar = CalendarRaw as any;
const Award = AwardRaw as any;
const DollarSign = DollarSignRaw as any;
const Bell = BellRaw as any;
const ChevronRight = ChevronRightRaw as any;
const LogOut = LogOutRaw as any;
const ArrowLeft = ArrowLeftRaw as any;
const User = UserRaw as any;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// A simple global state context is simulated by passing childId parameters or reading from local state.
// We'll implement a clean horizontal child switcher pill component at the top of every screen.

// ---------------------------------------------------------------------------
// SHARED CHILD SWITCHER HEADER
// ---------------------------------------------------------------------------
interface ChildSwitcherProps {
  childrenList: any[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
}

const ChildSwitcher: React.FC<ChildSwitcherProps> = ({ childrenList, selectedChildId, onSelectChild }) => {
  if (!childrenList || childrenList.length === 0) return null;
  if (childrenList.length === 1) {
    const child = childrenList[0];
    return (
      <View style={switcherStyles.container}>
        <Text style={switcherStyles.label}>Selected Student Profile</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <View style={[switcherStyles.pill, switcherStyles.pillActive, { margin: 0 }]}>
            <Text style={{ color: themeColors.primary, fontWeight: 'bold', fontSize: 13 }}>
              🎓 {child.firstName} {child.lastName}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={switcherStyles.container}>
      <Text style={switcherStyles.label}>Select Child Profile:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={switcherStyles.scroll}>
        {childrenList.map((c) => {
          const isActive = c.studentId === selectedChildId;
          return (
            <TouchableOpacity
              key={c.studentId}
              style={[switcherStyles.pill, isActive && switcherStyles.pillActive]}
              onPress={() => onSelectChild(c.studentId)}
            >
              <Text style={[switcherStyles.pillText, isActive && { color: themeColors.primary }]}>
                {c.firstName} {c.lastName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const switcherStyles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.card,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: themeColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  scroll: {
    flexDirection: 'row',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginRight: 8,
  },
  pillActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primaryMuted,
  },
  pillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: themeColors.textMuted,
  },
});

// ---------------------------------------------------------------------------
// GUARDIAN HOME SCREEN
// ---------------------------------------------------------------------------
function GuardianHomeScreen({ navigation, route }: any) {
  const { user, logout } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  
  // Children switcher lists
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  
  // Child metrics states
  const [childHome, setChildHome] = useState<any>(null);

  const fetchChildren = async () => {
    try {
      const res = await apiClient.get('/mobile/guardian/home');
      if (res.data?.data?.children) {
        const list = res.data.data.children;
        setChildren(list);
        
        // Restore/Set active selection
        if (list.length > 0) {
          setSelectedChildId(prev => prev || list[0].studentId);
        }
      }
    } catch (err) {
      console.warn('Failed to load children list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetail = async (childId: string) => {
    if (!childId) return;
    try {
      // Load summary and metadata context
      const res = await apiClient.get(`/mobile/guardian/attendance/${childId}/summary`);
      const feeRes = await apiClient.get(`/mobile/guardian/fees/${childId}`);
      
      const childObj = children.find(c => c.studentId === childId);
      
      setChildHome({
        studentId: childId,
        name: childObj ? `${childObj.firstName} ${childObj.lastName}` : 'Student',
        class: childObj?.className || 'N/A',
        section: childObj?.sectionName || 'N/A',
        roll: childObj?.rollNumber || 'N/A',
        attendancePercentage: res.data?.data?.percentage ?? 100,
        outstandingFeesTotal: feeRes.data?.data?.summary?.totalOutstandingMinor ?? 0,
      });
    } catch (e) {
      console.warn('Failed to fetch stats for child:', childId, e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchChildren();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildDetail(selectedChildId);
    }
  }, [selectedChildId, children]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      {/* Executive Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>Parent dashboard</Text>
          <Text style={styles.headerName}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={themeColors.danger} />
        </TouchableOpacity>
      </View>

      {/* Child Switcher Selector */}
      <ChildSwitcher
        childrenList={children}
        selectedChildId={selectedChildId}
        onSelectChild={(id) => setSelectedChildId(id)}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {childHome ? (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            {/* Child Identity Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>{childHome.name?.[0]}</Text>
              </View>
              <Text style={styles.profileName}>{childHome.name}</Text>
              <Text style={styles.profileMeta}>Grade: {childHome.class} | Section: {childHome.section}</Text>
              <Text style={styles.profileMeta}>Roll Number: {childHome.roll}</Text>
            </View>

            {/* Performance Indicators */}
            <View style={styles.metricGrid}>
              <MetricCard title="Attendance Rate" value={`${childHome.attendancePercentage}%`} variant="success" />
              <MetricCard
                title="Fees Balance"
                value={`₹${childHome.outstandingFeesTotal / 100}`}
                variant={childHome.outstandingFeesTotal > 0 ? 'danger' : 'default'}
              />
            </View>

            {/* Navigation Shortcuts */}
            <Text style={styles.sectionTitle}>Child Reports</Text>

            <TouchableOpacity
              style={styles.clickableCard}
              onPress={() => navigation.navigate('AttendanceTab', { childId: selectedChildId })}
            >
              <Calendar size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Attendance Calendar</Text>
                <Text style={styles.cardDesc}>Check daily logs and status indicators.</Text>
              </View>
              <ChevronRight size={18} color={themeColors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clickableCard}
              onPress={() => navigation.navigate('ResultsTab', { childId: selectedChildId })}
            >
              <Award size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Exam Report Cards</Text>
                <Text style={styles.cardDesc}>View grades and percentage breakdowns.</Text>
              </View>
              <ChevronRight size={18} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <EmptyState title="No Sibling Mappings" description="No linked student profiles found for this account." />
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN ATTENDANCE CALENDAR SCREEN
// ---------------------------------------------------------------------------
function GuardianAttendanceScreen({ navigation, route }: any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  
  // Attendance lists
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchChildrenData = async () => {
    try {
      const res = await apiClient.get('/mobile/guardian/home');
      if (res.data?.data?.children) {
        const list = res.data.data.children;
        setChildren(list);
        if (list.length > 0) {
          // Check if navigated with a specific childId
          const navChildId = route.params?.childId;
          setSelectedChildId(navChildId || list[0].studentId);
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (childId: string) => {
    if (!childId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/mobile/guardian/attendance/${childId}/summary`);
      if (res.data?.data) {
        const d = res.data.data;
        setSummary({
          presentCount: d.presentCount,
          excusedCount: d.leaveCount,
          percentage: d.percentage
        });
        setRecords(d.records || []);
      }
    } catch (e) {
      console.warn('Failed to load child attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchChildrenData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedChildId) {
      fetchAttendance(selectedChildId);
    }
  }, [selectedChildId]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>Attendance Calendar</Text>
      
      <ChildSwitcher
        childrenList={children}
        selectedChildId={selectedChildId}
        onSelectChild={(id) => setSelectedChildId(id)}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {summary && (
          <View style={styles.metricGrid}>
            <MetricCard title="Present Count" value={summary.presentCount ?? 0} variant="success" />
            <MetricCard title="Excused Absences" value={summary.excusedCount ?? 0} />
            <MetricCard title="Attendance Rate" value={`${summary.percentage ?? 100}%`} variant={summary.percentage >= 75 ? 'success' : 'warning'} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Daily Logs (Last 30 Days)</Text>
        {records.length === 0 ? (
          <EmptyState title="No Attendance Logs" description="No daily records submitted for this period." />
        ) : (
          records.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {new Date(item.session?.attendanceDate || item.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <AppBadge label={item.status} status={item.status} />
              </View>
              {item.remarks && <Text style={styles.cardDesc}>Teacher Remarks: {item.remarks}</Text>}
            </View>
          ))
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN EXAM RESULTS SCREEN
// ---------------------------------------------------------------------------
function GuardianResultsList({ navigation, route }: any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [exams, setExams] = useState<any[]>([]);

  const fetchChildrenData = async () => {
    try {
      const res = await apiClient.get('/mobile/guardian/home');
      if (res.data?.data?.children) {
        const list = res.data.data.children;
        setChildren(list);
        if (list.length > 0) {
          const navChildId = route.params?.childId;
          setSelectedChildId(navChildId || list[0].studentId);
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (childId: string) => {
    if (!childId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/school/exams/results/student?studentId=${childId}`);
      if (res.data?.data) {
        setExams(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to load child results:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchChildrenData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedChildId) {
      fetchResults(selectedChildId);
    }
  }, [selectedChildId]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>Academic Results</Text>
      
      <ChildSwitcher
        childrenList={children}
        selectedChildId={selectedChildId}
        onSelectChild={(id) => setSelectedChildId(id)}
      />

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clickableCard}
            onPress={() => navigation.navigate('ResultDetail', { studentId: selectedChildId, examId: item.examId, examName: item.examName })}
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
        )}
        ListEmptyComponent={() => <EmptyState title="No Results Published" description="Grades will display once published by school admin." />}
      />
    </AppScreen>
  );
}

function GuardianResultDetail({ route, navigation }: any) {
  const { studentId, examId, examName } = route.params;
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any[]>([]);

  const fetchDetail = async () => {
    try {
      const res = await apiClient.get(`/school/exams/results/student/${examId}?studentId=${studentId}`);
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

function ResultsStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={GuardianResultsList} />
      <Stack.Screen name="ResultDetail" component={GuardianResultDetail} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN FEES SCREEN
// ---------------------------------------------------------------------------
function GuardianFeesScreen({ route }: any) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [feeAccount, setFeeAccount] = useState<any>(null);

  const fetchChildrenData = async () => {
    try {
      const res = await apiClient.get('/mobile/guardian/home');
      if (res.data?.data?.children) {
        const list = res.data.data.children;
        setChildren(list);
        if (list.length > 0) {
          const navChildId = route.params?.childId;
          setSelectedChildId(navChildId || list[0].studentId);
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async (childId: string) => {
    if (!childId) return;
    setLoading(true);
    try {
      const feeRes = await apiClient.get(`/mobile/guardian/fees/${childId}`);
      if (feeRes.data?.data) {
        setFeeAccount(feeRes.data.data);
      }
    } catch (e) {
      console.warn('Failed to load child fees account:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchChildrenData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedChildId) {
      fetchFees(selectedChildId);
    }
  }, [selectedChildId]);

  if (loading) return <LoadingState />;

  const summary = feeAccount?.summary;
  const totalCharged = summary?.totalChargedMinor || 0;
  const totalPaid = summary?.totalPaidMinor || 0;
  const outstanding = summary?.totalOutstandingMinor || 0;

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>Outstanding Fees</Text>

      <ChildSwitcher
        childrenList={children}
        selectedChildId={selectedChildId}
        onSelectChild={(id) => setSelectedChildId(id)}
      />

      <View style={styles.metricGrid}>
        <MetricCard title="Total Cost Mapped" value={`₹${totalCharged / 100}`} />
        <MetricCard title="Net Cleared" value={`₹${totalPaid / 100}`} variant="success" />
      </View>

      <View style={[styles.card, outstanding > 0 ? styles.dueCardAlert : styles.dueCardPaid]}>
        <Text style={styles.dueCardTitle}>Pending Balance Due</Text>
        <Text style={[styles.dueCardValue, outstanding > 0 ? { color: themeColors.danger } : { color: themeColors.success }]}>
          ₹{outstanding / 100}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Fee Installments Ledger</Text>
      {(!feeAccount?.charges || feeAccount.charges.length === 0) ? (
        <EmptyState title="No Mapped Structures" description="Outstanding fees ledger is empty." />
      ) : (
        feeAccount.charges.map((c: any) => {
          const paidAmt = c.allocations?.reduce((sum: number, a: any) => sum + a.amountMinor, 0) ?? 0;
          const balance = c.amountMinor - paidAmt;
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{c.description || 'School Tuition installment'}</Text>
                <AppBadge label={c.status} status={c.status} />
              </View>
              <Text style={styles.cardDesc}>Total Cost: ₹{c.amountMinor / 100}</Text>
              <Text style={styles.cardDesc}>Cleared: ₹{paidAmt / 100} | Outstanding: ₹{balance / 100}</Text>
              <Text style={styles.cardDesc}>Due Date: {new Date(c.dueDate).toLocaleDateString()}</Text>
            </View>
          );
        })
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN NOTIFICATIONS SCREEN
// ---------------------------------------------------------------------------
function GuardianNotificationsScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/mobile/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.post(`/mobile/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchNotifications();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Notifications</Text>

      {notifications.length === 0 ? (
        <EmptyState title="Clear Inbox" description="No unread circular announcements or notices." />
      ) : (
        notifications.map((item: any) => {
          const isUnread = !item.readAt;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, isUnread && styles.unreadCard]}
              onPress={() => isUnread && handleMarkRead(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {isUnread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.homeworkBodyText}>{item.message}</Text>
              <Text style={styles.cardDesc}>Received: {new Date(item.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          );
        })
      )}
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN PROFILE SCREEN
// ---------------------------------------------------------------------------
function GuardianProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0] || 'G'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.profileMeta}>{user?.email}</Text>
        <Text style={styles.profileMeta}>User Role: Registered Guardian</Text>
        <View style={{ alignSelf: 'center', marginTop: 12 }}>
          <AppBadge label="Verified Guardian Account" status="APPROVED" />
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

      <View style={{ padding: 16 }}>
        <AppButton title="Sign Out" variant="danger" onPress={logout} />
      </View>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN PORTAL TABS
// ---------------------------------------------------------------------------
export default function GuardianNavigator() {
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
        component={GuardianHomeScreen}
        options={{ title: 'Home', tabBarIcon: ({ color }: any) => <Users size={20} color={color} /> }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={GuardianAttendanceScreen}
        options={{ title: 'Attendance', tabBarIcon: ({ color }: any) => <Calendar size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ResultsTab"
        component={ResultsStackScreen}
        options={{ title: 'Results', tabBarIcon: ({ color }: any) => <Award size={20} color={color} /> }}
      />
      <Tab.Screen
        name="FeesTab"
        component={GuardianFeesScreen}
        options={{ title: 'Fees', tabBarIcon: ({ color }: any) => <DollarSign size={20} color={color} /> }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={GuardianNotificationsScreen}
        options={{ title: 'Alerts', tabBarIcon: ({ color }: any) => <Bell size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={GuardianProfileScreen}
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
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
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
  homeworkBodyText: {
    fontSize: 14,
    color: themeColors.text,
    marginVertical: 8,
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 20,
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
  unreadCard: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.infoMuted,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: themeColors.primary,
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
});
