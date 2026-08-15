import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../../features/parent/screens/HomeScreen';
import AttendanceScreen from '../../features/parent/screens/AttendanceScreen';
import HomeworkScreen from '../../features/parent/screens/HomeworkScreen';
import ResultsScreen from '../../features/parent/screens/ResultsScreen';
import FeesScreen from '../../features/parent/screens/FeesScreen';
import TimetableScreen from '../../features/parent/screens/TimetableScreen';
import CommunicationScreen from '../../features/parent/screens/CommunicationScreen';
import NotificationsScreen from '../../features/parent/screens/NotificationsScreen';
import ProfileScreen from '../../features/parent/screens/ProfileScreen';
import ROUTES from '../../constants/routes';
import { theme } from '../../theme';

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
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
          if (route.name === ROUTES.PARENT_HOME) iconName = 'home-outline';
          else if (route.name === ROUTES.PARENT_ATTENDANCE) iconName = 'calendar-outline';
          else if (route.name === ROUTES.PARENT_HOMEWORK) iconName = 'book-outline';
          else if (route.name === ROUTES.PARENT_RESULTS) iconName = 'stats-chart-outline';
          else if (route.name === ROUTES.PARENT_FEES) iconName = 'wallet-outline';
          else if (route.name === ROUTES.PARENT_TIMETABLE) iconName = 'time-outline';
          else if (route.name === ROUTES.PARENT_COMMUNICATION) iconName = 'chatbubbles-outline';
          else if (route.name === ROUTES.PARENT_NOTIFICATIONS) iconName = 'notifications-outline';
          else if (route.name === ROUTES.PARENT_PROFILE) iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name={ROUTES.PARENT_HOME} component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name={ROUTES.PARENT_ATTENDANCE} component={AttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name={ROUTES.PARENT_HOMEWORK} component={HomeworkScreen} options={{ tabBarLabel: 'Homework' }} />
      <Tab.Screen name={ROUTES.PARENT_RESULTS} component={ResultsScreen} options={{ tabBarLabel: 'Results' }} />
      <Tab.Screen name={ROUTES.PARENT_FEES} component={FeesScreen} options={{ tabBarLabel: 'Fees' }} />
      <Tab.Screen name={ROUTES.PARENT_TIMETABLE} component={TimetableScreen} options={{ tabBarLabel: 'Schedule' }} />
      <Tab.Screen name={ROUTES.PARENT_COMMUNICATION} component={CommunicationScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name={ROUTES.PARENT_NOTIFICATIONS} component={NotificationsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name={ROUTES.PARENT_PROFILE} component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
