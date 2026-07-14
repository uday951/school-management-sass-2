import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../features/auth/LoginScreen';
import { LoadingState } from '../components/ui';

// Import Custom Feature Navigators
import TeacherNavigator from '../features/teacher/TeacherNavigator';
import StudentNavigator from '../features/student/StudentNavigator';
import GuardianNavigator from '../features/guardian/GuardianNavigator';
import PrincipalNavigator from '../features/principal/PrincipalNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, activeRole } = useAuth();

  if (isLoading) return <LoadingState />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : activeRole === 'TEACHER' ? (
          <Stack.Screen name="Teacher" component={TeacherNavigator} />
        ) : activeRole === 'STUDENT' ? (
          <Stack.Screen name="Student" component={StudentNavigator} />
        ) : activeRole === 'GUARDIAN' ? (
          <Stack.Screen name="Guardian" component={GuardianNavigator} />
        ) : (
          <Stack.Screen name="Principal" component={PrincipalNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
