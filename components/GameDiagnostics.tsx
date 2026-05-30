// components/GameDiagnostics.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface GameDiagnosticsProps {
  currentStatus: string;
  debugLogs: string[];
  networkErrorDetails: string | null;
}

export default function GameDiagnostics({ currentStatus, debugLogs, networkErrorDetails }: GameDiagnosticsProps) {
  const router = useRouter();

  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#ebd59b" />
      <Text style={styles.loadingText}>KONSOLA DIAGNOSTYCZNA GRY</Text>
      <Text style={styles.statusSubText}>Aktualny stan: {currentStatus}</Text>

      {/* Sekcja na surowe szczegóły błędu sieciowego */}
      {networkErrorDetails && (
        <View style={styles.errorDetailsBox}>
          <Text style={styles.errorTitleText}>🚨 DETALE BŁĘDU SIECIOWEGO:</Text>
          <Text style={styles.errorBodyText}>{networkErrorDetails}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.retryButtonText}>POWRÓT DO LOGOWANIA</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista logów krok po kroku */}
      <View style={styles.logContainer}>
        <Text style={styles.logHeader}>Historia operacji:</Text>
        <ScrollView style={styles.logScroll}>
          {debugLogs.map((log, index) => (
            <Text key={index} style={styles.logItemText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117', padding: 20 },
  loadingText: { marginTop: 15, color: '#ebd59b', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  statusSubText: { color: '#8a94a6', fontSize: 13, marginTop: 5, fontStyle: 'italic', textAlign: 'center' },
  errorDetailsBox: { backgroundColor: '#2a1a1e', borderWidth: 1, borderColor: '#e74c3c', padding: 12, borderRadius: 4, width: '100%', marginTop: 20 },
  errorTitleText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  errorBodyText: { color: '#ff8a8a', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  retryButton: { backgroundColor: '#e74c3c', padding: 10, borderRadius: 4, marginTop: 12, alignItems: 'center' },
  retryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  logContainer: { width: '100%', height: 180, backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 4, marginTop: 20, padding: 10 },
  logHeader: { color: '#ebd59b', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  logScroll: { flex: 1 },
  logItemText: { color: '#c9d1d9', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 3 }
});