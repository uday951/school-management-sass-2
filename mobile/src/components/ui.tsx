import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// Professional School-Management Light Palette
export const themeColors = {
  background: '#F8FAFC',  // Clean light grey
  card: '#FFFFFF',        // Pure white surfaces
  border: '#E2E8F0',      // Soft slate border
  text: '#0F172A',        // Deep Navy primary text
  textMuted: '#64748B',   // Cool grey secondary text
  primary: '#2563EB',     // Premium Blue primary brand
  primaryMuted: '#DBEAFE', // Muted Blue highlight background
  danger: '#EF4444',      // Soft semantic red
  dangerMuted: '#FEE2E2', // Muted red background
  success: '#10B981',     // Soft semantic green
  successMuted: '#D1FAE5', // Muted green background
  warning: '#F59E0B',     // Soft semantic orange/yellow
  warningMuted: '#FEF3C7', // Muted yellow background
  info: '#3B82F6',        // Info blue
  infoMuted: '#EFF6FF',   // Info light blue background
};

// 1. APP SCREEN CONTAINER
export const AppScreen: React.FC<{
  children: React.ReactNode;
  scrollable?: boolean;
}> = ({ children, scrollable = false }) => {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={themeColors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {scrollable ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={styles.flex}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 2. METRIC CARD
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}> = ({ title, value, subtitle, variant = 'default' }) => {
  let valColor = themeColors.text;
  let bgHighlight = 'transparent';

  if (variant === 'success') {
    valColor = themeColors.success;
    bgHighlight = themeColors.successMuted;
  } else if (variant === 'danger') {
    valColor = themeColors.danger;
    bgHighlight = themeColors.dangerMuted;
  } else if (variant === 'warning') {
    valColor = themeColors.warning;
    bgHighlight = themeColors.warningMuted;
  }

  return (
    <View style={[styles.metricCard, variant !== 'default' && { backgroundColor: bgHighlight, borderColor: valColor }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color: valColor }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );
};

// 3. EMPTY STATE
export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionTitle?: string;
  onActionPress?: () => void;
}> = ({ title, description, actionTitle, onActionPress }) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>
      {actionTitle && onActionPress && (
        <TouchableOpacity style={styles.emptyBtn} onPress={onActionPress}>
          <Text style={styles.emptyBtnText}>{actionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// 4. LOADING STATE
export const LoadingState: React.FC = () => {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );
};

// 5. OFFLINE BANNER
export const OfflineBanner: React.FC<{ isOffline?: boolean }> = ({ isOffline = false }) => {
  if (!isOffline) return null;
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>No internet connection. Caching active.</Text>
    </View>
  );
};

// 6. THEMED BUTTON
export const AppButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}> = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  let bg = themeColors.primary;
  let border = 'transparent';
  let txt = '#FFFFFF';

  if (variant === 'danger') {
    bg = themeColors.danger;
  } else if (variant === 'success') {
    bg = themeColors.success;
  } else if (variant === 'outline') {
    bg = 'transparent';
    border = themeColors.border;
    txt = themeColors.text;
  }

  const isBtnDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, borderWidth: border !== 'transparent' ? 1 : 0 },
        isBtnDisabled && { opacity: 0.5, backgroundColor: variant === 'outline' ? 'transparent' : themeColors.textMuted },
        style
      ]}
      onPress={onPress}
      disabled={isBtnDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? themeColors.text : '#FFFFFF'} />
      ) : (
        <Text style={[styles.btnText, { color: txt }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// 7. INPUT FIELD
export const AppInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
}> = ({ label, value, onChangeText, placeholder, secureTextEntry, disabled = false }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && { backgroundColor: themeColors.background, color: themeColors.textMuted }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        editable={!disabled}
      />
    </View>
  );
};

// 8. CUSTOM SEMANTIC BADGE
export const AppBadge: React.FC<{
  label: string;
  status: 'PENDING' | 'DRAFT' | 'SUBMITTED' | 'LOCKED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE' | 'PUBLISHED' | 'ACTIVE' | 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}> = ({ label, status }) => {
  let bg = themeColors.border;
  let text = themeColors.textMuted;

  switch (status) {
    case 'SUBMITTED':
    case 'APPROVED':
    case 'PAID':
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'PRESENT':
      bg = themeColors.successMuted;
      text = themeColors.success;
      break;
    case 'DRAFT':
    case 'PENDING':
    case 'PARTIALLY_PAID':
    case 'LATE':
      bg = themeColors.warningMuted;
      text = themeColors.warning;
      break;
    case 'LOCKED':
      bg = themeColors.infoMuted;
      text = themeColors.info;
      break;
    case 'REJECTED':
    case 'UNPAID':
    case 'OVERDUE':
    case 'ABSENT':
      bg = themeColors.dangerMuted;
      text = themeColors.danger;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.background,
  },
  metricCard: {
    flex: 1,
    backgroundColor: themeColors.card,
    borderRadius: 12, // Restrained radii
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: themeColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  metricSubtitle: {
    fontSize: 11,
    color: themeColors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginHorizontal: 16,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: themeColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: themeColors.primaryMuted,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.primary,
  },
  offlineBanner: {
    backgroundColor: themeColors.warningMuted,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.warning,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: {
    color: themeColors.warning,
    fontWeight: 'bold',
    fontSize: 12,
  },
  btn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  btnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.text,
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: themeColors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingHorizontal: 12,
    color: themeColors.text,
    fontSize: 14,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
