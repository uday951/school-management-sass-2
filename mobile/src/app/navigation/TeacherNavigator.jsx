import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../../features/teacher/screens/HomeScreen';
import ClassesScreen from '../../features/teacher/screens/ClassesScreen';
import AttendanceScreen from '../../features/teacher/screens/AttendanceScreen';
import HomeworkScreen from '../../features/teacher/screens/HomeworkScreen';
import ExamsScreen from '../../features/teacher/screens/ExamsScreen';
import MessagesScreen from '../../features/teacher/screens/MessagesScreen';
import AnnouncementsScreen from '../../features/teacher/screens/AnnouncementsScreen';
import LeaveScreen from '../../features/teacher/screens/LeaveScreen';
import PayslipsScreen from '../../features/teacher/screens/PayslipsScreen';
import ProfileScreen from '../../features/teacher/screens/ProfileScreen';
import ROUTES from '../../constants/routes';
import { theme } from '../../theme';

const Tab = createBottomTabNavigator();

export default function TeacherNavigator() {
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
          if (route.name === ROUTES.TEACHER_HOME) iconName = 'home-outline';
          else if (route.name === ROUTES.TEACHER_CLASSES) iconName = 'people-outline';
          else if (route.name === ROUTES.TEACHER_ATTENDANCE) iconName = 'calendar-outline';
          else if (route.name === ROUTES.TEACHER_HOMEWORK) iconName = 'book-outline';
          else if (route.name === ROUTES.TEACHER_EXAMS) iconName = 'stats-chart-outline';
          else if (route.name === ROUTES.TEACHER_MESSAGES) iconName = 'chatbubbles-outline';
          else if (route.name === ROUTES.TEACHER_ANNOUNCEMENTS) iconName = 'notifications-outline';
          else if (route.name === ROUTES.TEACHER_LEAVE) iconName = 'briefcase-outline';
          else if (route.name === ROUTES.TEACHER_PAYSLIPS) iconName = 'wallet-outline';
          else if (route.name === ROUTES.TEACHER_PROFILE) iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name={ROUTES.TEACHER_HOME} component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name={ROUTES.TEACHER_CLASSES} component={ClassesScreen} options={{ tabBarLabel: 'Classes' }} />
      <Tab.Screen name={ROUTES.TEACHER_ATTENDANCE} component={AttendanceScreen} options={{ tabBarLabel: 'Register' }} />
      <Tab.Screen name={ROUTES.TEACHER_HOMEWORK} component={HomeworkScreen} options={{ tabBarLabel: 'Homework' }} />
      <Tab.Screen name={ROUTES.TEACHER_EXAMS} component={ExamsScreen} options={{ tabBarLabel: 'Exams' }} />
      <Tab.Screen name={ROUTES.TEACHER_MESSAGES} component={MessagesScreen} options={{ tabBarLabel: 'Chats' }} />
      <Tab.Screen name={ROUTES.TEACHER_ANNOUNCEMENTS} component={AnnouncementsScreen} options={{ tabBarLabel: 'Circulars' }} />
      <Tab.Screen name={ROUTES.TEACHER_LEAVE} component={LeaveScreen} options={{ tabBarLabel: 'Leaves' }} />
      <Tab.Screen name={ROUTES.TEACHER_PAYSLIPS} component={PayslipsScreen} options={{ tabBarLabel: 'Payroll' }} />
      <Tab.Screen name={ROUTES.TEACHER_PROFILE} component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
