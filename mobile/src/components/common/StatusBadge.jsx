import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

export default function StatusBadge({ status = 'pending', text }) {
  const normalized = status.toLowerCase();
  const isApproved = normalized === 'approved' || normalized === 'paid' || normalized === 'present';
  const isRejected = normalized === 'rejected' || normalized === 'failed' || normalized === 'absent';
  
  const badgeStyle = [
    styles.badge,
    isApproved && styles.approvedBg,
    isRejected && styles.rejectedBg,
    (!isApproved && !isRejected) && styles.pendingBg
  ];

  const textStyle = [
    styles.text,
    isApproved && styles.approvedText,
    isRejected && styles.rejectedText,
    (!isApproved && !isRejected) && styles.pendingText
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{(text || status).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  approvedBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  rejectedBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  pendingBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  text: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold
  },
  approvedText: {
    color: theme.colors.light.secondary
  },
  rejectedText: {
    color: theme.colors.light.error
  },
  pendingText: {
    color: theme.colors.light.accent
  }
});
