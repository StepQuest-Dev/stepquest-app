import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../services/api';

export default function DeveloperPanel() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Konsola admina gotowa do pracy.']);

  const addLocalLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev]);
  };

  const handleAddMockSteps = async (amount: number) => {
    setSyncing(true);
    addLocalLog(`Inicjalizacja wysyłki makiety: +${amount} kroków...`);

    try {
      // Pobieramy aktualny stan kroków z bazy, aby prawidłowo dodać wartość
      addLocalLog("Pobieram aktualną sumę kroków z serwera...");
      let currentSteps = 0;
      try {
        const res = await api.get('/steps/latest');
        currentSteps = res.data.steps || res.data.count || 0;
      } catch (e) {
        addLocalLog("Brak poprzednich wpisów w bazie, startuję od 0.");
      }

      const updatedSteps = currentSteps + amount;
      addLocalLog(`Wysyłam nową sumę (${updatedSteps}) do NestJS (/steps)...`);
      
      await api.post('/steps', { count: updatedSteps });
      addLocalLog(`✅ Sukces! Baza zsynchronizowana na wartość: ${updatedSteps}`);
    } catch (err: any) {
      addLocalLog(`❌ Błąd: ${err.message}`);
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* NAGŁÓWEK */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/profile')}>
          <FontAwesome5 name="arrow-left" size={16} color="#ebd59b" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>NARZĘDZIA DEWELOPERSKIE</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* INFORMACJE SIECIOWE */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🌐 STATUS POŁĄCZENIA</Text>
        <Text style={styles.infoText}>Target BaseURL: <Text style={styles.highlight}>{api.defaults.baseURL}</Text></Text>
        <Text style={styles.infoText}>Platforma uruchomieniowa: <Text style={styles.highlight}>{Platform.OS.toUpperCase()}</Text></Text>
      </View>

      {/* SEKCJA GENEROWANIA KROKÓW (MOCK PANEL) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👟 EMULATOR AKTYWNOŚCI (MOCK STEPS)</Text>
          {syncing && <ActivityIndicator size="small" color="#ebd59b" />}
        </View>
        <Text style={styles.sectionSubtitle}>Wstrzyknij wirtualne kroki bezpośrednio do bazy danych swojego profilu NestJS:</Text>
        
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.mockButton} onPress={() => handleAddMockSteps(1000)} disabled={syncing}>
            <Text style={styles.buttonText}>+1 000 KROKÓW</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mockButton, styles.mockButtonEpic]} onPress={() => handleAddMockSteps(5000)} disabled={syncing}>
            <Text style={styles.buttonText}>+5 000 KROKÓW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DEWELOPERSKA KONSOLA WYPLUWANIA LOGÓW */}
      <View style={styles.consoleContainer}>
        <Text style={styles.consoleTitle}>📋 MONITOR OPERACJI SIECIOWYCH</Text>
        <ScrollView style={styles.consoleScroll} contentContainerStyle={{ paddingBottom: 10 }}>
          {logs.map((log, i) => (
            <Text key={i} style={styles.consoleText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12181f', padding: 12 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Platform.OS === 'ios' ? 20 : 10, marginBottom: 15, paddingHorizontal: 8 },
  backButton: { width: 40, height: 40, backgroundColor: '#1d2631', borderWidth: 2, borderColor: '#a38450', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { color: '#ebd59b', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  infoCard: { backgroundColor: '#1d2631', borderWidth: 2, borderColor: '#a38450', borderRadius: 4, padding: 12, marginBottom: 15 },
  infoTitle: { color: '#ebd59b', fontWeight: 'bold', fontSize: 13, marginBottom: 6, letterSpacing: 0.5 },
  infoText: { color: '#8a94a6', fontSize: 12, marginTop: 2 },
  highlight: { color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold' },
  sectionCard: { backgroundColor: '#171f2a', borderWidth: 2, borderColor: '#ebd59b', borderRadius: 4, padding: 15, marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { color: '#ebd59b', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  sectionSubtitle: { color: '#8a94a6', fontSize: 12, lineHeight: 18, marginBottom: 15 },
  buttonsRow: { flexDirection: 'row', gap: 12 },
  mockButton: { flex: 1, backgroundColor: '#2a3642', borderWidth: 1, borderColor: '#a38450', paddingVertical: 12, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  mockButtonEpic: { backgroundColor: '#352e25', borderColor: '#ebd59b' },
  buttonText: { color: '#ebd59b', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  consoleContainer: { flex: 1, backgroundColor: '#0d1117', borderWidth: 2, borderColor: '#454f5b', borderRadius: 4, padding: 12 },
  consoleTitle: { color: '#8a94a6', fontWeight: 'bold', fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  consoleScroll: { flex: 1 },
  consoleText: { color: '#c9d1d9', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 4 }
});