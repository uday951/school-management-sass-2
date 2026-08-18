import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export default function ScreenContainer({
  children,
  scrollable = false,
  loading = false,
  title,
  headerRight,
  style
}) {
  const content = scrollable ? (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flexContent}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.light.background} />
      
      {title && (
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>{title}</Text>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.light.primary} />
        </View>
      ) : (
        <View style={[styles.mainContainer, style]}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.light.background
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
    backgroundColor: theme.colors.light.card
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text
  },
  mainContainer: {
    flex: 1
  },
  flexContent: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
