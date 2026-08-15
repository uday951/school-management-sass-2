import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../../features/principal/screens/HomeScreen';
import StudentsOverviewScreen from '../../features/principal/screens/StudentsOverviewScreen';
import TeachersOverviewScreen from '../../features/principal/screens/TeachersOverviewScreen';
import AttendanceScreen from '../../features/principal/screens/AttendanceScreen';
import FinanceScreen from '../../features/principal/screens/FinanceScreen';
import ApprovalsScreen from '../../features/principal/screens/ApprovalsScreen';
import AnnouncementsScreen from '../../features/principal/screens/AnnouncementsScreen';
import ProfileScreen from '../../features/principal/screens/ProfileScreen';
import ROUTES from '../../constants/routes';
import { theme } from '../../theme';

const Tab = createBottomTabNavigator();

export default function PrincipalNavigator() {
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
          else if (route.name === ROUTES.PRINCIPAL_ATTENDANCE) iconName = 'calendar-outline';
          else if (route.name === ROUTES.PRINCIPAL_FINANCE) iconName = 'wallet-outline';
          else if (route.name === ROUTES.PRINCIPAL_APPROVALS) iconName = 'checkbox-outline';
          else if (route.name === ROUTES.PRINCIPAL_ANNOUNCEMENTS) iconName = 'notifications-outline';
          else if (route.name === ROUTES.PRINCIPAL_PROFILE) iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name={ROUTES.PRINCIPAL_HOME} component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_STUDENTS} component={StudentsOverviewScreen} options={{ tabBarLabel: 'Students' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_TEACHERS} component={TeachersOverviewScreen} options={{ tabBarLabel: 'Teachers' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_ATTENDANCE} component={AttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_FINANCE} component={FinanceScreen} options={{ tabBarLabel: 'Finance' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_APPROVALS} component={ApprovalsScreen} options={{ tabBarLabel: 'Approvals' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_ANNOUNCEMENTS} component={AnnouncementsScreen} options={{ tabBarLabel: 'Post' }} />
      <Tab.Screen name={ROUTES.PRINCIPAL_PROFILE} component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
