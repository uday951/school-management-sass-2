import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ROUTES from '../../constants/routes';
import { theme } from '../../theme';

import DashboardScreen from '../../features/principal/dashboard/DashboardScreen';
import StudentsOverviewScreen from '../../features/principal/students/StudentsOverviewScreen';
import TeachersOverviewScreen from '../../features/principal/teachers/TeachersOverviewScreen';
import AttendanceScreen from '../../features/principal/attendance/AttendanceScreen';
import AcademicsScreen from '../../features/principal/academics/AcademicsScreen';
import ExaminationsScreen from '../../features/principal/examinations/ExaminationsScreen';
import FinanceScreen from '../../features/principal/finance/FinanceScreen';
import FeesScreen from '../../features/principal/fees/FeesScreen';
import TransportScreen from '../../features/principal/transport/TransportScreen';
import ReportsScreen from '../../features/principal/reports/ReportsScreen';
import ApprovalsScreen from '../../features/principal/approvals/ApprovalsScreen';
import CommunicationScreen from '../../features/principal/communication/CommunicationScreen';
import NotificationsScreen from '../../features/principal/notifications/NotificationsScreen';
import SettingsScreen from '../../features/principal/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PrincipalTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.light.primary,
        tabBarInactiveTintColor: theme.colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.light.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.light.border
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === ROUTES.PRINCIPAL_HOME) iconName = 'home-outline';
          else if (route.name === ROUTES.PRINCIPAL_STUDENTS) iconName = 'people-outline';
          else if (route.name === ROUTES.PRINCIPAL_TEACHERS) iconName = 'school-outline';
          else if (route.name === ROUTES.PRINCIPAL_APPROVALS) iconName = 'checkbox-outline';
          else if (route.name === ROUTES.PRINCIPAL_SETTINGS) iconName = 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name={ROUTES.PRINCIPAL_HOME} component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_STUDENTS} component={StudentsOverviewScreen} options={{ tabBarLabel: 'Students' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_TEACHERS} component={TeachersOverviewScreen} options={{ tabBarLabel: 'Teachers' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_APPROVALS} component={ApprovalsScreen} options={{ tabBarLabel: 'Approvals' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_SETTINGS} component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function PrincipalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PrincipalTabs" component={PrincipalTabs} />
      <Stack.Screen name={ROUTES.PRINCIPAL_ATTENDANCE} component={AttendanceScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_ACADEMICS} component={AcademicsScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_EXAMINATIONS} component={ExaminationsScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_FINANCE} component={FinanceScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_FEES} component={FeesScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_TRANSPORT} component={TransportScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_REPORTS} component={ReportsScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_COMMUNICATION} component={CommunicationScreen} />
      <Stack.Screen name={ROUTES.PRINCIPAL_NOTIFICATIONS} component={NotificationsScreen} />
      {/* Fallback for profile route if invoked directly */}
      <Stack.Screen name={ROUTES.PRINCIPAL_PROFILE} component={SettingsScreen} />
      {/* Old announcements fallback */}
      <Stack.Screen name={ROUTES.PRINCIPAL_ANNOUNCEMENTS} component={CommunicationScreen} />
    </Stack.Navigator>
  );
}
