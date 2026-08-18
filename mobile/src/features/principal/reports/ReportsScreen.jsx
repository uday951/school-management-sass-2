import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportsScreen() {
  const handleDownload = (reportType) => {
    // In a real implementation, this would trigger a file download or share sheet
    Alert.alert('Download Started', `Downloading ${reportType}...`);
  };

  const handleView = (reportType) => {
    Alert.alert('View Report', `Opening ${reportType} viewer...`);
  };

  const ReportCard = ({ title, description }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.viewBtn]} onPress={() => handleView(title)}>
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.dlBtn]} onPress={() => handleDownload(title)}>
          <Text style={styles.dlBtnText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Institution Reports</Text>
        
        <ReportCard 
          title="Student Summary Report" 
          description="Comprehensive overview of student enrollment, demographics, and performance metrics." 
        />
        
        <ReportCard 
          title="Teacher Directory" 
          description="Complete list of academic staff, their departments, and contact information." 
        />
        
        <ReportCard 
          title="Finance & Accounting" 
          description="Monthly financial statements, income streams, and expense reports." 
        />
        
        <ReportCard 
          title="Attendance Trends" 
          description="Historical attendance data for both students and staff." 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  cardInfo: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  description: { fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginLeft: 10 },
  viewBtn: { backgroundColor: '#e3f2fd' },
  viewBtnText: { color: theme.colors.primary, fontWeight: '600' },
  dlBtn: { backgroundColor: theme.colors.primary },
  dlBtnText: { color: '#fff', fontWeight: '600' }
});
