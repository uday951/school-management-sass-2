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
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import { AppScreen, LoadingState, EmptyState, MetricCard, AppButton, AppBadge, themeColors } from '../../components/ui';
import { useIsFocused } from '@react-navigation/native';
import {
  LayoutDashboard as LayoutDashboardRaw,
  CalendarCheck as CalendarCheckRaw,
  DoorOpen as DoorOpenRaw,
  Megaphone as MegaphoneRaw,
  User as UserRaw,
  Plus as PlusRaw,
  LogOut as LogOutRaw,
  Check as CheckRaw,
  X as XRaw,
  FileText as FileTextRaw,
  Users as UsersRaw,
  Lock as LockRaw,
} from 'lucide-react-native';

const LayoutDashboard = LayoutDashboardRaw as any;
const CalendarCheck = CalendarCheckRaw as any;
const DoorOpen = DoorOpenRaw as any;
const Megaphone = MegaphoneRaw as any;
const User = UserRaw as any;
const Plus = PlusRaw as any;
const LogOut = LogOutRaw as any;
const Check = CheckRaw as any;
const X = XRaw as any;
const FileText = FileTextRaw as any;
const Users = UsersRaw as any;
const Lock = LockRaw as any;

const Tab = createBottomTabNavigator();

// ---------------------------------------------------------------------------
// PRINCIPAL DASHBOARD SCREEN
// ---------------------------------------------------------------------------
function PrincipalDashboardScreen() {
  const { school, logout } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    totalStudentsCount: 0,
    totalStaffCount: 0,
    activeVisitorsCount: 0,
    pendingGatePassesCount: 0,
    pendingLeaveRequestsCount: 0,
  });

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/mobile/principal/dashboard');
      if (res.data?.data) {
        const d = res.data.data;
        setMetrics({
          totalStudentsCount: d.totalStudents ?? 0,
          totalStaffCount: d.totalEmployees ?? 0,
          activeVisitorsCount: d.insideCount ?? 0,
          pendingGatePassesCount: d.pendingPasses ?? 0,
          pendingLeaveRequestsCount: d.pendingLeaves ?? 0,
        });
      }
    } catch (err) {
      console.warn('Failed to load principal metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDashboard();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  return (
    <AppScreen scrollable>
      {/* Executive Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>Executive Control Console</Text>
          <Text style={styles.headerName}>{school?.name || 'Greenfield School'}</Text>
          <Text style={styles.headerRole}>Principal Workspace</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={themeColors.danger} />
        </TouchableOpacity>
      </View>

      {/* Metric 2x2 grid */}
      <Text style={styles.sectionTitle}>School Metrics Overview</Text>
      
      <View style={styles.metricGrid}>
        <MetricCard title="Total Students" value={metrics.totalStudentsCount ?? 0} />
        <MetricCard title="Academic Staff" value={metrics.totalStaffCount ?? 0} />
      </View>

      <View style={styles.metricGrid}>
        <MetricCard title="Visitors Checked In" value={metrics.activeVisitorsCount ?? 0} variant="success" />
        <MetricCard
          title="Pending Gate Passes"
          value={metrics.pendingGatePassesCount ?? 0}
          variant={metrics.pendingGatePassesCount > 0 ? 'warning' : 'default'}
        />
      </View>

      {/* Critical Leaves Alert Banner */}
      <View style={styles.metricGrid}>
        <MetricCard
          title="Staff Leaves Review"
          value={`${metrics.pendingLeaveRequestsCount ?? 0} Requests`}
          variant={metrics.pendingLeaveRequestsCount > 0 ? 'warning' : 'default'}
          subtitle="Requires authorization review."
        />
      </View>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// STAFF LEAVE REQUESTS APPROVAL CONSOLE
// ---------------------------------------------------------------------------
function PrincipalLeaveApprovals() {
  const isFocused = useIsFocused();
  const { activeYear } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Reject Comment Modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await apiClient.get('/school/staff-ops/leave-requests');
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load leaves for principal review:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchLeaves();
    }
  }, [isFocused]);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED', comment: string) => {
    if (!activeYear?.id) {
      Alert.alert('Configuration Error', 'Active academic year is not set up.');
      return;
    }
    setActioningId(id);
    try {
      await apiClient.post(`/school/staff-ops/leave-requests/${id}/review`, {
        status,
        comment,
        academicYearId: activeYear.id
      });
      Alert.alert('Status Updated', `Leave request successfully ${status.toLowerCase()}.`);
      fetchLeaves();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Review Error', err.response?.data?.message || 'Failed to review request.');
    } finally {
      setActioningId(null);
      setCommentModalVisible(false);
      setRejectReason('');
      setSelectedRequestId('');
    }
  };

  const confirmApprove = (id: string) => {
    Alert.alert(
      'Approve Leave Request',
      'Are you sure you want to authorize this staff leave application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => handleReview(id, 'APPROVED', 'Approved by Principal.') }
      ]
    );
  };

  const triggerReject = (id: string) => {
    setSelectedRequestId(id);
    setCommentModalVisible(true);
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>Staff Leaves Desk</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isPending = item.status === 'PENDING';
          const isActioning = actioningId === item.id;
          
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.employee?.firstName} {item.employee?.lastName}</Text>
                  <Text style={styles.cardDesc}>Designation: {item.employee?.designation || 'Staff'}</Text>
                </View>
                <AppBadge label={item.status} status={item.status} />
              </View>
              
              <Text style={styles.cardDesc}>Leave Type: {item.leaveType?.name}</Text>
              <Text style={styles.cardDesc}>
                Duration: {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.homeworkBodyText}>Reason: {item.reason}</Text>

              {isPending && (
                <View style={styles.actionsRow}>
                  <AppButton
                    title="Reject"
                    variant="danger"
                    disabled={isActioning}
                    onPress={() => triggerReject(item.id)}
                    style={{ flex: 1 }}
                  />
                  <AppButton
                    title="Approve"
                    variant="success"
                    disabled={isActioning}
                    onPress={() => confirmApprove(item.id)}
                    style={{ flex: 1.5 }}
                  />
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={() => <EmptyState title="No Leaves Pending" description="All staff leave applications resolved!" />}
      />

      {/* REJECT COMMENT MODAL */}
      <Modal animationType="fade" transparent={true} visible={commentModalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Leave Application</Text>
            <Text style={styles.modalSubtitle}>Provide review remarks clarify reasons for rejection.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Inadequate substitute coverage for mathematics classes"
              placeholderTextColor={themeColors.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setCommentModalVisible(false);
                  setRejectReason('');
                }}
              />
              <AppButton
                title="Reject Leave"
                variant="danger"
                onPress={() => handleReview(selectedRequestId, 'REJECTED', rejectReason)}
                disabled={!rejectReason.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// EARLY EXIT GATE PASS REVIEW
// ---------------------------------------------------------------------------
function PrincipalGatePasses() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [passes, setPasses] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchPasses = async () => {
    try {
      const res = await apiClient.get('/school/gate/gate-passes?status=PENDING');
      if (res.data?.data) {
        setPasses(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load pending gate passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPasses();
    }
  }, [isFocused]);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActioningId(id);
    try {
      const actionEndpoint = status === 'APPROVED' ? 'approve' : 'reject';
      await apiClient.post(`/school/gate/gate-passes/${id}/${actionEndpoint}`, {
        comment: status === 'APPROVED' ? 'Approved by Principal.' : 'Rejected by Principal.'
      });
      Alert.alert('Gate Pass Updated', `Gate pass request ${status.toLowerCase()}.`);
      fetchPasses();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Update Failed', err.response?.data?.message || 'Failed to review gate pass.');
    } finally {
      setActioningId(null);
    }
  };

  const confirmApprove = (id: string) => {
    Alert.alert(
      'Approve Early Exit Gate Pass',
      'Are you sure you want to authorize early student departure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => handleReview(id, 'APPROVED') }
      ]
    );
  };

  const confirmReject = (id: string) => {
    Alert.alert(
      'Reject Early Exit Gate Pass',
      'Are you sure you want to decline this early student departure request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline Request', style: 'destructive', onPress: () => handleReview(id, 'REJECTED') }
      ]
    );
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>Gate Pass Console</Text>

      <FlatList
        data={passes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isActioning = actioningId === item.id;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.student?.firstName} {item.student?.lastName}</Text>
                  <Text style={styles.cardDesc}>Grade Level: {item.enrollment?.class?.name} - {item.enrollment?.section?.name}</Text>
                </View>
                <AppBadge label={item.status} status={item.status} />
              </View>
              <Text style={styles.cardDesc}>Request Cycle: {item.requestType}</Text>
              <Text style={styles.cardDesc}>Departure Time: {new Date(item.requestedExitAt).toLocaleTimeString()}</Text>
              <Text style={styles.homeworkBodyText}>Reason: {item.reason}</Text>

              {item.status === 'PENDING' && (
                <View style={styles.actionsRow}>
                  <AppButton
                    title="Reject"
                    variant="danger"
                    disabled={isActioning}
                    onPress={() => confirmReject(item.id)}
                    style={{ flex: 1 }}
                  />
                  <AppButton
                    title="Approve Exit"
                    variant="success"
                    disabled={isActioning}
                    onPress={() => confirmApprove(item.id)}
                    style={{ flex: 1.5 }}
                  />
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={() => <EmptyState title="No Gate Passes" description="No student exit authorization requests pending." />}
      />
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// SCHOOL ANNOUNCEMENTS PUBLISHER
// ---------------------------------------------------------------------------
function PrincipalAnnouncements() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [audience, setAudience] = useState<'ALL_SCHOOL' | 'TEACHERS' | 'ALL_STUDENTS'>('ALL_SCHOOL');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/school/communication/announcements');
      if (res.data?.data) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAnnouncements();
    }
  }, [isFocused]);

  const handlePost = async () => {
    if (!title || !body) {
      Alert.alert('Required Fields', 'Please complete the announcement title and body fields.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/school/communication/announcements', {
        title,
        body,
        priority,
        audiences: [{ audienceType: audience }],
      });
      Alert.alert('Success', 'School announcement published successfully!');
      setModalVisible(false);
      setTitle('');
      setBody('');
      setPriority('NORMAL');
      setAudience('ALL_SCHOOL');
      fetchAnnouncements();
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Posting Failed', err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>School Notices</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>Published: {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <AppBadge label={item.priority} status={item.priority === 'URGENT' ? 'UNPAID' : item.priority === 'IMPORTANT' ? 'PENDING' : 'LOCKED'} />
            </View>
            <Text style={styles.homeworkBodyText}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={() => <EmptyState title="No Announcements" description="Publish a new school circular notice by tapping the + icon." />}
      />

      {/* CREATE ANNOUNCEMENT MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Publish Announcement Circular</Text>

            <TextInput
              style={styles.modalInputText}
              placeholder="Announcement Title"
              placeholderTextColor={themeColors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.modalInputText, { height: 100 }]}
              placeholder="Enter announcement instructions detail body..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={body}
              onChangeText={setBody}
            />

            <Text style={styles.label}>Broadcast Audience Priority</Text>
            <ScrollView horizontal style={styles.pickerRow} showsHorizontalScrollIndicator={false}>
              {(['NORMAL', 'IMPORTANT', 'URGENT'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.pickerPill, priority === p && styles.pickerPillActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.pickerPillText, priority === p && { color: themeColors.primary }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Target Broadcast Group</Text>
            <ScrollView horizontal style={styles.pickerRow} showsHorizontalScrollIndicator={false}>
              {(['ALL_SCHOOL', 'TEACHERS', 'ALL_STUDENTS'] as const).map(aud => (
                <TouchableOpacity
                  key={aud}
                  style={[styles.pickerPill, audience === aud && styles.pickerPillActive]}
                  onPress={() => setAudience(aud)}
                >
                  <Text style={[styles.pickerPillText, audience === aud && { color: themeColors.primary }]}>
                    {aud.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <AppButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <AppButton title="Publish Notice" onPress={handlePost} loading={submitting} />
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
function PrincipalProfileScreen() {
  const { user, school, logout, activeYear } = useAuth();

  return (
    <AppScreen scrollable>
      <Text style={styles.screenTitle}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0] || 'P'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.profileMeta}>{user?.email}</Text>
        <Text style={styles.profileMeta}>User Role: School Principal</Text>
        <View style={{ alignSelf: 'center', marginTop: 12 }}>
          <AppBadge label="Executive Status: Active" status="SUBMITTED" />
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
        <Text style={styles.profileCardDesc}>GIS Code: {school?.code}</Text>
        {activeYear && (
          <Text style={styles.profileCardDesc}>Academic Term: {activeYear.name}</Text>
        )}
      </View>

      <View style={{ padding: 16 }}>
        <AppButton title="Sign Out" variant="danger" onPress={logout} />
      </View>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// PRINCIPAL FACULTY DETAILS SCREEN
// ---------------------------------------------------------------------------
function PrincipalFacultyScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFaculty = async () => {
    try {
      const res = await apiClient.get('/mobile/principal/faculty');
      if (res.data?.data) {
        setFaculty(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load faculty list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFaculty();
    }
  }, [isFocused]);

  if (loading) return <LoadingState />;

  const filteredFaculty = faculty.filter(item => {
    const name = `${item.firstName} ${item.lastName}`.toLowerCase();
    const designation = item.designation.toLowerCase();
    const department = item.department.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || designation.includes(query) || department.includes(query);
  });

  return (
    <AppScreen>
      <Text style={styles.screenTitle}>Faculty Status Directory</Text>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <TextInput
          style={styles.modalInputText}
          placeholder="Search by name, dept or designation..."
          placeholderTextColor={themeColors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredFaculty}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          let checkInBadgeStatus: "PENDING" | "SUBMITTED" | "REJECTED" = "PENDING";
          if (item.checkInStatus === 'PRESENT') checkInBadgeStatus = "SUBMITTED";
          if (item.checkInStatus === 'ABSENT') checkInBadgeStatus = "REJECTED";

          let dutyBadgeStatus: "PENDING" | "SUBMITTED" | "LOCKED" | "REJECTED" = "PENDING";
          if (item.studentAttendanceStatus === 'COMPLETED') dutyBadgeStatus = "SUBMITTED";
          if (item.studentAttendanceStatus === 'PARTIAL') dutyBadgeStatus = "LOCKED";

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.cardDesc}>{item.designation} ({item.department})</Text>
                </View>
              </View>

              <View style={{ marginTop: 8, gap: 4 }}>
                <Text style={styles.cardDesc}>
                  Class Teacher: <Text style={{ fontWeight: 'bold', color: themeColors.text }}>{item.leadingClass}</Text>
                </Text>
                <Text style={styles.cardDesc}>
                  Classes Scheduled Today: <Text style={{ fontWeight: 'bold', color: themeColors.text }}>{item.classesTodayCount}</Text>
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderTopColor: themeColors.border, paddingTop: 10 }}>
                <View>
                  <Text style={{ fontSize: 10, color: themeColors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Staff Check-In</Text>
                  <AppBadge label={item.checkInStatus} status={checkInBadgeStatus} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10, color: themeColors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Roll Call Completed</Text>
                  <AppBadge label={item.studentAttendanceStatus} status={dutyBadgeStatus} />
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => <EmptyState title="No Faculty Found" description="Try adjusting your search criteria." />}
      />
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// MAIN PORTAL NAVIGATOR
// ---------------------------------------------------------------------------
export default function PrincipalNavigator() {
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
        name="DashboardTab"
        component={PrincipalDashboardScreen}
        options={{ title: 'Home', tabBarIcon: ({ color }: any) => <LayoutDashboard size={20} color={color} /> }}
      />
      <Tab.Screen
        name="LeavesTab"
        component={PrincipalLeaveApprovals}
        options={{ title: 'Leaves', tabBarIcon: ({ color }: any) => <CalendarCheck size={20} color={color} /> }}
      />
      <Tab.Screen
        name="GatePassTab"
        component={PrincipalGatePasses}
        options={{ title: 'Gate Pass', tabBarIcon: ({ color }: any) => <DoorOpen size={20} color={color} /> }}
      />
      <Tab.Screen
        name="FacultyTab"
        component={PrincipalFacultyScreen}
        options={{ title: 'Faculty', tabBarIcon: ({ color }: any) => <Users size={20} color={color} /> }}
      />
      <Tab.Screen
        name="AnnouncementsTab"
        component={PrincipalAnnouncements}
        options={{ title: 'Notices', tabBarIcon: ({ color }: any) => <Megaphone size={20} color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={PrincipalProfileScreen}
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
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 6,
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
  modalInputText: {
    height: 46,
    backgroundColor: themeColors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingHorizontal: 12,
    color: themeColors.text,
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.text,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
    fontWeight: 'bold',
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
