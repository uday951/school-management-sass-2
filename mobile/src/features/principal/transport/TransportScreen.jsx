import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { principalApi } from '../../../services/api/principal.api';
import { theme } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransportScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [vehiclesRes, routesRes] = await Promise.all([
        principalApi.getVehicles(),
        principalApi.getRoutes()
      ]);
      setVehicles(vehiclesRes.data?.data || []);
      setRoutes(routesRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Active Vehicles</Text>
        <View style={styles.grid}>
          {vehicles.map((v, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.plate}>{v.licensePlate || v.registrationNumber}</Text>
              <Text style={styles.driver}>Driver: {v.driverName || 'Unassigned'}</Text>
              <Text style={styles.capacity}>Capacity: {v.capacity}</Text>
              <View style={[styles.statusBadge, { backgroundColor: v.status === 'active' ? theme.colors.success : theme.colors.warning }]}>
                <Text style={styles.statusText}>{v.status}</Text>
              </View>
            </View>
          ))}
          {vehicles.length === 0 && <Text style={styles.emptyText}>No vehicles found</Text>}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Transport Routes</Text>
        {routes.map((r, i) => (
          <View key={i} style={styles.routeCard}>
            <Text style={styles.routeName}>{r.routeName || r.name}</Text>
            <Text style={styles.routeDetail}>Stops: {r.stops?.length || 0}</Text>
            <Text style={styles.routeDetail}>Assigned Vehicle: {r.assignedVehicle || 'None'}</Text>
          </View>
        ))}
        {routes.length === 0 && <Text style={styles.emptyText}>No routes found</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  plate: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  driver: { fontSize: 12, color: '#555', marginBottom: 2 },
  capacity: { fontSize: 12, color: '#555', marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  routeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  routeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  routeDetail: { fontSize: 14, color: '#666' },
  emptyText: { color: '#999', fontStyle: 'italic', width: '100%', textAlign: 'center', padding: 10 }
});
