import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '../../theme';

export default function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
