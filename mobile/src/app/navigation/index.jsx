import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../../store/authStore';
import AuthStack from './AuthStack';
import ParentNavigator from './ParentNavigator';
import TeacherNavigator from './TeacherNavigator';
import PrincipalNavigator from './PrincipalNavigator';
import LoadingState from '../../components/feedback/LoadingState';
import ROLES from '../../constants/roles';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, role, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : role === ROLES.PARENT ? (
          <Stack.Screen name="Parent" component={ParentNavigator} />
        ) : role === ROLES.TEACHER ? (
          <Stack.Screen name="Teacher" component={TeacherNavigator} />
        ) : role === ROLES.SCHOOL_ADMIN || role === ROLES.SUPER_ADMIN ? (
          <Stack.Screen name="Principal" component={PrincipalNavigator} />
        ) : (
          <Stack.Screen name="Unauthorized">
            {() => (
              <View style={styles.container}>
                <Text style={styles.errorText}>Unauthorized Role Configuration</Text>
                <Text style={styles.subText}>This mobile application client does not support your user role.</Text>
              </View>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF'
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  }
});
