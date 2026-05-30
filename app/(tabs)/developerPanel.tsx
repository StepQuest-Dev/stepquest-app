import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import { styles } from '../../styles/tabs/developerPanel'; // Import wyodrębnionych stylów

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